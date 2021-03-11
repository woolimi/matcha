import express from 'express';
import jwt from 'jsonwebtoken';
import authToken from '../middleware/authToken';
import User from '../models/User';
import bcrypt from 'bcrypt';
import validator from '../middleware/validator';
import { send_verification_email, send_reset_password_email } from '../services/Mailing';
import { deleteRefreshToken, generateToken, setRefreshToken } from '../services/Token';
import getLocation from '../middleware/getLocation';
import Model from '../models/Model';
import randomstring from 'randomstring';

const authRouter = express.Router();

authRouter.post('/login', validator.userLogin, async (req, res) => {
	// Check username and password
	try {
		const loginForm = req.body;
		// check username
		const queryResult = await User.query('SELECT * FROM users WHERE username = ? LIMIT 1', [loginForm.username]);
		if (!queryResult.length) {
			console.log(`username(${loginForm.username}) not matched`);
			return res.status(403).json({ error: 'Wrong username or password' });
		}
		// check password
		const user = queryResult[0];
		const isValidPassword = await bcrypt.compare(loginForm.password, user.password);
		if (!isValidPassword) {
			console.log(`${loginForm.username}'s password not matched`);
			return res.status(403).json({ error: 'Wrong username or password' });
		}
		// return tokens
		const u = { id: user.id };
		const refresh_token = setRefreshToken(res, u);
		return res.json({
			access_token: generateToken(u, 'access'),
			refresh_token,
		});
	} catch (error) {
		console.log(error);
		res.sendStatus(403);
	}
});

authRouter.post('/refresh', async (req, res) => {
	// check refresh token
	let refresh_token = req.cookies['auth._refresh_token.cookie'];
	if (!refresh_token)
		return res.json({
			error: 'refresh_token not exist',
		});
	try {
		const user: any = await jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
		delete user.exp;
		delete user.iat;
		// set new refresh_token in safe cookie
		refresh_token = setRefreshToken(res, user);
		// return access token through json
		return res.json({
			access_token: generateToken(user, 'access'),
			refresh_token,
		});
	} catch (error) {
		console.log('REFRESH TOKEN ERROR: ', error);
		res.json({
			error: 'invlid refresh_token',
		});
	}
});

authRouter.delete('/logout', (req, res) => {
	// delete cookies
	const refresh_token = req.cookies[process.env.REFRESH_COOKIE_NAME];
	if (!refresh_token) return res.sendStatus(200);
	deleteRefreshToken(res);
	return res.sendStatus(200);
});

authRouter.post('/register', validator.userRegister, getLocation, async (req, res) => {
	try {
		const formData = req.body;
		await Model.query('START TRANSACTION');
		const result = await User.register(formData);
		await send_verification_email(formData.email, result.insertId);
		await Model.query('COMMIT');
		return res.sendStatus(201);
	} catch (error) {
		console.error(error);
		await Model.query('ROLLBACK');
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});

authRouter.post('/reset-password', async (req, res) => {
	const data = req.body;
	try {
		const result = await User.query('SELECT * FROM users WHERE username = ? LIMIT 1', [data.username]);
		if (!result.length) throw { error: 'Invalid username' };
		if (!result[0].verified) throw { error: 'Cannot send to unverified email address' };

		const email = result[0].email;
		const token = generateToken({ id: result[0].id }, 'access');
		if (!token) throw { error: 'Fail to generate token ' };

		await Model.query('START TRANSACTION');
		await User.query('UPDATE users SET reset_password_token = ? WHERE id = ? LIMIT 1', [token, result[0].id]);

		await send_reset_password_email(email, token);
		await Model.query('COMMIT');

		return res.status(200).json({ message: 'Please check your email to reset password' });
	} catch (e) {
		console.log(e);
		await Model.query('ROLLBACK');
		if (e.error) {
			res.status(403).json({ error: e.error });
		} else res.status(500).json({ error: 'Internal Server Error' });
	}
});

authRouter.get('/reset-password/:jwt', async (req, res) => {
	try {
		const token = req.params.jwt;
		const result = await User.query('SELECT * FROM users WHERE reset_password_token = ? LIMIT 1', [token]);
		console.log(result);
		if (!result.length) throw { error: 'Invalid token' };
		const user: any = await jwt.verify(req.params.jwt, process.env.ACCESS_TOKEN_SECRET);
		const new_password = randomstring.generate(10);
		const encrypt_password = await bcrypt.hash(new_password, 10);

		await User.query('UPDATE users SET password = ?, reset_password_token = "" WHERE id = ?', [
			encrypt_password,
			user.id,
		]);

		res.status(200).render('reset-password', {
			result: `Your new temperary password is ${new_password}`,
		});
	} catch (e) {
		console.log(e);
		let result = '';
		if (e instanceof jwt.TokenExpiredError) {
			result = 'Expired token';
		} else if (e instanceof jwt.JsonWebTokenError) {
			result = 'Invalid token';
		} else if (e.error) {
			result = e.error;
		} else result = e;
		return res.status(401).render('reset-password', {
			result,
		});
	}
});

authRouter.post('/social', getLocation, async (req, res) => {
	try {
		const uinfo = req.body;
		let user_id;

		if (uinfo.provider === 'google') {
			user_id = await User.register_google(uinfo);
		} else throw 'No provider info';

		const user = await User.me(user_id);

		return res.status(200).json({
			user,
			access_token: generateToken({ id: user.id }, 'access'),
			refresh_token: setRefreshToken(res, { id: user.id }),
		});
	} catch (error) {
		console.error(error);
		res.sendStatus(400);
	}
});

authRouter.get('/email-verification/:jwt', async (req, res) => {
	try {
		const user: any = await jwt.verify(req.params.jwt, process.env.ACCESS_TOKEN_SECRET);
		const result = await User.query('UPDATE users SET verified = ? WHERE id = ?', [true, user.id]);
		if (!result.affectedRows) throw Error(`User id ${user.id} doesn't exist.`);
		res.redirect('/auth/email-verification?result=success');
	} catch (error) {
		console.log('EMAIL VERIFICATION ERROR : ', error);
		if (error instanceof jwt.TokenExpiredError) {
			res.redirect('/auth/email-verification?result=fail&reason=' + encodeURIComponent('Expired token'));
		} else {
			res.redirect('/auth/email-verification?result=fail&reason=' + encodeURIComponent('Invalid token'));
		}
	}
});

authRouter.get('/email-verification', (req, res) => {
	if (req.query.result === 'success') {
		res.status(200).render('email-verification', {
			app: process.env.APP,
		});
	} else {
		res.status(401).render('email-verification', {
			app: process.env.APP,
		});
	}
});

authRouter.get('/me', authToken, async (req: any, res) => {
	const id = req.user.id;
	try {
		const user = await User.me(id);
		return res.send({ user });
	} catch (error) {
		console.log(error);
		deleteRefreshToken(res);
		return res.sendStatus(400);
	}
});

export default authRouter;
