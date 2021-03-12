import { Response } from 'express';
import Model from '../models/Model';
import User from '../models/User';
import { send_reset_password_email, send_verification_email } from '../services/Mailing';
import jwt from 'jsonwebtoken';
import { deleteRefreshToken, generateToken, setRefreshToken } from '../services/Token';
import bcrypt from 'bcrypt';

export default class AuthentificationController {
	static async register(req: any, res: Response) {
		try {
			const formData = req.body;
			await Model.query('START TRANSACTION');
			const result = await User.register(formData);
			await send_verification_email(formData.email, result.insertId);
			await Model.query('COMMIT');
			return res.status(201).json({ success: 'Successfully registered' });
		} catch (error) {
			console.error(error);
			await Model.query('ROLLBACK');
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	static async socialRegister(req: any, res: Response) {
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
			return res.status(400).json({ error: 'Could not register trough the provider' });
		}
	}

	static async verifyEmail(req: any, res: Response) {
		try {
			const user: any = await jwt.verify(req.params.jwt, process.env.ACCESS_TOKEN_SECRET);
			const result = await User.query('UPDATE users SET verified = ? WHERE id = ?', [true, user.id]);
			if (!result.affectedRows) throw Error(`User id ${user.id} doesn't exist.`);
			res.redirect('/auth/email-verification?result=success');
		} catch (error) {
			console.log('EMAIL VERIFICATION ERROR : ', error);
			if (error instanceof jwt.TokenExpiredError) {
				return res.redirect(
					'/auth/email-verification?result=fail&reason=' + encodeURIComponent('Expired token')
				);
			}
			return res.redirect('/auth/email-verification?result=fail&reason=' + encodeURIComponent('Invalid token'));
		}
	}

	static verifyEmailPage(req: any, res: Response) {
		if (req.query.result === 'success') {
			return res.status(200).render('email-verification', {
				app: process.env.APP,
			});
		} else {
			return res.status(401).render('email-verification', {
				app: process.env.APP,
			});
		}
	}

	static async login(req: any, res: Response) {
		// Check username and password
		try {
			const loginForm = req.body;

			// check username
			const queryResult = await User.query('SELECT * FROM users WHERE username = ? LIMIT 1', [
				loginForm.username,
			]);
			if (!queryResult.length) {
				console.log(`username(${loginForm.username}) not matched`);
				return res.status(403).json({ error: 'Wrong username or password.' });
			}

			// check password
			const user = queryResult[0];
			const isValidPassword = await bcrypt.compare(loginForm.password, user.password);
			if (!isValidPassword) {
				console.log(`${loginForm.username}'s password not matched`);
				return res.status(403).json({ error: 'Wrong username or password.' });
			}

			// Update location if set_location is not enabled
			if (loginForm.location && loginForm.location.lat && loginForm.location.lng) {
				await User.updateLocation(user.id, loginForm.location);
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
			return res.status(403).json({ error: 'Invalid request.' });
		}
	}

	static async me(req: any, res: Response) {
		try {
			const user = await User.me(req.user.id);
			return res.json({ user });
		} catch (error) {
			console.log(error);
			deleteRefreshToken(res);
			return res.status(400).json({ error: 'Failed to get User Profile' });
		}
	}

	static async refresh(req: any, res: Response) {
		// check refresh token
		let refresh_token = req.cookies['auth._refresh_token.cookie'];
		if (!refresh_token) {
			return res.json({ error: 'refresh_token not exist' });
		}
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
			return res.status(400).json({
				error: 'Invalid refresh_token',
			});
		}
	}

	static async logout(req: any, res: Response) {
		// delete cookies
		const refresh_token = req.cookies[process.env.REFRESH_COOKIE_NAME];
		if (!refresh_token) {
			return res.status(200).json({ success: 'Logged out' });
		}
		deleteRefreshToken(res);
		return res.status(200).json({ success: 'Logged out' });
	}

	static async resetPassword(req: any, res: Response) {
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
	}

	static async resetPasswordVerify(req: any, res: Response) {
		try {
			const token = req.params.jwt;
			const result = await User.query('SELECT * FROM users WHERE reset_password_token = ? LIMIT 1', [token]);
			console.log(result);
			if (!result.length) throw { error: 'Invalid token' };
			const user: any = await jwt.verify(req.params.jwt, process.env.ACCESS_TOKEN_SECRET);
			const new_password = Randomstring.generate(10);
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
	}
}
