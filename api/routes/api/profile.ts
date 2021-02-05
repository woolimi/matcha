import express, { Request } from 'express';
import authToken from '../../middleware/authToken';
import User from '../../models/User';
import { send_verification_email } from '../../services/Mailing';
import validator from '../../middleware/validator';
import mime from 'mime-types';
import FileType from 'file-type';
import fs from 'fs';
import path from 'path';
import { upload } from '../../middleware/multer';

const profileRouter = express.Router();

profileRouter.put('/images/:user_id/:image_id', authToken, upload.single('image'), async (req, res) => {
	try {
		const fileType = await FileType.fromFile(req.file.path);
		if (!fileType || fileType.ext !== mime.extension(req.file.mimetype)) {
			await fs.unlink(path.resolve(__dirname, '../../', req.file.path), (err) => {
				if (err) console.log(err);
			});
			res.sendStatus(400);
		}
	} catch (error) {
		console.error(error);
	}
});

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
		await User.updateLocation(location);
		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

export default profileRouter;
