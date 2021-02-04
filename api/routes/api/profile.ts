import express from 'express';
import authToken from '../../middleware/authToken';
import User from '../../models/User';
import { send_verification_email } from '../../services/Mailing';
import validator from '../../middleware/validator';

const profileRouter = express.Router();

// get user
profileRouter.post('/send-email-verification', authToken, validator.userEmailVerification, async (req: any, res) => {
	try {
		const data = req.body;

		await User.query('UPDATE users SET email = ?, verified = false WHERE id = ?', [data.email, req.user.id]);
		await send_verification_email(data.email, req.user.id);

		res.json({
			message: 'Email has been sent successfully.',
			email: data.email,
			verified: false,
		});
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

profileRouter.post('/location', authToken, validator.userLocation, async (req, res) => {
	try {
		const location = req.body;
		await User.query('UPDATE users SET location = ST_SRID(POINT(?, ?), 4326)', [location[0], location[1]]);
		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

export default profileRouter;
