import express from 'express';
import User from '../../models/User';

const checkRouter = express.Router();

// get user
checkRouter.post('/email', async (req, res) => {
	try {
		const email = req.body.email;
		const check = await User.query('SELECT id FROM users WHERE email = ?', [email]);
		if (!check || check.length == 0) res.json({ success: 'E-mail available.' });
		else res.json({ error: 'E-mail already taken.' });
	} catch (error) {
		res.status(400);
	}
});

checkRouter.post('/username', async (req, res) => {
	try {
		const username = req.body.username;
		const check = await User.query('SELECT id FROM users WHERE username = ?', [username]);
		if (!check || check.length == 0) res.json({ success: 'Username available.' });
		else res.json({ error: 'Username already taken.' });
	} catch (error) {
		res.status(400);
	}
});

export default checkRouter;
