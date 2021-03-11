import { Response } from 'express';
import User from '../models/User';

export default class CheckController {
	static async checkEmail(req: any, res: Response) {
		const email = req.body.email;
		const check = await User.query('SELECT id FROM users WHERE email = ?', [email]);
		if (!check || check.length == 0) res.json({ success: 'E-mail available.' });
		else res.json({ error: 'E-mail already taken.' });
	}

	static async checkUsername(req: any, res: Response) {
		const username = req.body.username;
		const check = await User.query('SELECT id FROM users WHERE username = ?', [username]);
		if (!check || check.length == 0) res.json({ success: 'Username available.' });
		else res.json({ error: 'Username already taken.' });
	}
}
