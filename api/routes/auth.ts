import express, { query } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import authToken from '../middleware/authToken';
import User from '../models/User';
import { ResultSetHeader } from 'mysql2';
import Mailing from '../init/Mailing';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import validator from '../middleware/validator';

const authRouter = express.Router();

// access_token -> client session cookie
// refresh_token -> Secure/HttpOnly/SameSite cookie

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
	let refresh_token = req.cookies['auth._refresh_token.local'];
	if (!refresh_token) return res.sendStatus(401);
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
		res.sendStatus(403);
	}
});

authRouter.delete('/logout', (req, res) => {
	// delete cookies
	const refresh_token = req.cookies['auth._refresh_token.local'];
	if (!refresh_token) return res.sendStatus(200);
	deleteRefreshToken(res);
	return res.sendStatus(200);
});

authRouter.post('/register', validator.userRegister, async (req, res) => {
	const formData = req.body;
	try {
		const result: ResultSetHeader = await User.register(formData);
		// send email with jwt (15 mins limit)
		const token = generateToken({ id: result.insertId }, 'access');
		// TODO: Mailgun API
		const mail = await Mailing.send_email_to_verify(
			formData.email,
			`http://localhost:5000/auth/email-verification/${token}`
		);
		console.log('Email : ', mail);
		console.log('Email verification token : ', token);
		// set refresh token
		setRefreshToken(res, { id: result.insertId });
		res.sendStatus(201);
	} catch (error) {
		console.error(error);
		res.sendStatus(403);
	}
});

authRouter.get('/email-verification/:jwt', async (req, res) => {
	try {
		const user: any = await jwt.verify(req.params.jwt, process.env.ACCESS_TOKEN_SECRET);
		const queryResult = await User.query('UPDATE users SET verified = ? WHERE id = ?', [true, user.id]);
		if (!queryResult.affectedRows) throw Error(`User id ${user.id} doesn't exist.`);
		res.redirect('http://localhost:3000/app/profile');
	} catch (error) {
		console.log('/email-verification : ', error);
		if (error instanceof jwt.TokenExpiredError) {
			res.status(401).send('Your token is expired.');
		} else res.status(403);
	}
});

authRouter.get('/me', authToken, async (req: any, res) => {
	const id = req.user.id;
	try {
		const user = await User.find(id);
		const trimedUser = _.pick(user, ['id', 'email', 'username', 'lastName', 'firstName', 'verified']);
		res.send({ user: trimedUser });
	} catch (error) {
		console.log(error);
	}
});

function setRefreshToken(res: any, user: any) {
	const rtoken = generateToken(user, 'refresh');
	res.cookie('auth._refresh_token.local', rtoken, {
		expires: new Date(Date.now() + 3600 * 24 * 7),
		secure: false,
		httpOnly: true,
		sameSite: true,
	});
	return rtoken;
}

function deleteRefreshToken(res: any) {
	return res.cookie('auth._refresh_token.local', 'false', {
		expires: new Date(Date.now()),
		secure: false,
		httpOnly: false,
		sameSite: false,
	});
}

function generateToken(obj: object, option: string = 'access') {
	// expires after half and hour (1800 seconds = 30 minutes)
	if (option == 'access') {
		const access = jwt.sign(obj, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: `${60 * 15}s`, // 15 mins
		});
		console.log('access token generated');
		return access;
	}
	if (option == 'refresh') {
		const refresh = jwt.sign(obj, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: `${3600 * 24 * 7}s`, // 1 week
		});
		console.log('refresh token generated');
		return refresh;
	}
}

export default authRouter;
