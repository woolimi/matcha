import fs from 'fs';
import path from 'path';
import FileType from 'file-type';
import express from 'express';
import authToken from '../../middleware/authToken';
import { upload } from '../../middleware/multer';
import User from '../../models/User';
import { send_verification_email } from '../../services/Mailing';
import validator from '../../middleware/validator';
import UserPicture from '../../models/UserPicture';

const profileRouter = express.Router();

profileRouter.put(
	'/images/:user_id/:image_id',
	authToken,
	validator.userPictures,
	upload.single('image'),
	async (req: any, res) => {
		try {
			const fileType = await FileType.fromFile(req.file.path);
			if (!fileType || fileType.mime !== req.file.mimetype) {
				fs.unlink(path.resolve(__dirname, '../../', req.file.path), (err) => {
					if (err) console.log(err);
				});
				return res.json({ error: 'Invalid image' });
			}
			await UserPicture.create_or_update(req.params.user_id, req.params.image_id, req.file.path);
			const images = await UserPicture.get_images(req.params.user_id);
			res.json({ images });
		} catch (error) {
			console.error(error);
			res.sendStatus(500);
		}
	}
);

profileRouter.post('/images/:user_id/:image_id', authToken, validator.userPictures, async (req: any, res) => {
	try {
		await UserPicture.delete_image(req.params.user_id, req.params.image_id, req.body.path);
		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

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

profileRouter.post('/public-info', authToken, validator.userPublic, async (req: any, res) => {
	try {
		await User.updatePublic(req.user.id, req.body);
		return res.sendStatus(200);
	} catch (error) {
		console.error(error);
		return res.sendStatus(200);
	}
});

profileRouter.post('/change-password', authToken, validator.userChangePassword, async (req: any, res) => {
	try {
		await User.changePassword(req.body);
		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		return res.sendStatus(500);
	}
});

export default profileRouter;
