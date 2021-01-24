import express from 'express';
import User from '../../models/User';

const registerCheckRouter = express.Router();

// get user
registerCheckRouter.post('/email', async (req, res) => {
	try {
		const email = req.body.email;
		const check = await User.query('SELECT id FROM users WHERE email = ?', [email]);
		res.send({ unique: !check || check.length == 0 });
	} catch (error) {
		res.status(400);
	}
});
registerCheckRouter.post('/username', async (req, res) => {
	try {
		const username = req.body.username;
		const check = await User.query('SELECT id FROM users WHERE username = ?', [username]);
		res.send({ unique: !check || check.length == 0 });
	} catch (error) {
		res.status(400);
	}
});

export default registerCheckRouter;
