import express from 'express';
import jwt from 'jsonwebtoken';
import authToken from '../middleware/authToken';
import User from '../models/User';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import validator from '../middleware/validator';
import path from 'path';
import { send_verification_email } from '../services/Mailing';
import geoip from 'geoip-lite';
import { deleteRefreshToken, generateToken, setRefreshToken } from '../services/Token';

const authRouter = express.Router();

authRouter.post('/login', validator.userLogin, async (req, res) => {
	// Check username and password
	try {
		const loginForm = req.body;
		// check username
		const queryResult = await User.query('SELECT * FROM users WHERE username = ? LIMIT 1', [loginForm.username]);
		if (!queryResult.length) {
			console.log(`email(${loginForm.username}) not matched`);
			return res.status(200).send({ error: 'Wrong email or password' });
		}
		// check password
		const user = queryResult[0];
		const isValidPassword = await bcrypt.compare(loginForm.password, user.password);
		if (!isValidPassword) {
			console.log(`${loginForm.username}'s password not matched`);
			return res.status(200).send({ error: 'Wrong email or password' });
		}
		// return tokens
		const u = _.pick(user, ['id']);
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

authRouter.post('/register', validator.userRegister, async (req, res) => {
	const formData = req.body;
	// Find location by IP if browser gps diabled
	if (_.isEmpty(formData.location)) {
		const ip: any = req.clientIp;
		let ll = geoip.lookup(ip)?.ll;
		let location = { lat: 48.8566, lng: 2.3522 }; // set paris by default
		if (ll) location = { lat: ll[0], lng: ll[1] };

		formData.location = location;
	}

	try {
		const result = await User.register(formData);
		await send_verification_email(formData.email, result.insertId);
		return res.sendStatus(201);
	} catch (error) {
		console.error(error);
		return res.sendStatus(403);
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
			res.redirect('/auth/email-verification?result=fail&reason=' + encodeURIComponent('Your token is expired'));
		} else {
			res.redirect('/auth/email-verification?result=fail&reason=' + encodeURIComponent('Invalid token'));
		}
	}
});

authRouter.get('/email-verification', (req, res) => {
	if (req.query.result === 'success') {
		res.status(200).sendFile(path.join(__dirname, '../views', 'email-verification.html'));
	} else {
		res.status(401).sendFile(path.join(__dirname, '../views', 'email-verification.html'));
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
