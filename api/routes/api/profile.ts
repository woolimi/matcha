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
import UserNotification, { Notification, NotificationWithUserInterface } from '../../models/UserNotification';
import UserTag from '../../models/UserTag';
import UserLanguage from '../../models/UserLanguage';
import UserBlock from '../../models/UserBlock';
import UserLike from '../../models/UserLike';
import Chat from '../../models/Chat';

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
		return res.sendStatus(500);
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

profileRouter.get('/:id', authToken, async (req: any, res) => {
	const id = req.params.id;
	const self = req.user.id;

	// Check if the user is not blocked
	const isBlocked = await UserBlock.status(id, self);
	if (isBlocked) return res.status(401).json({ error: 'The User has blocked you.' });

	// Get the profile informations
	const profile = await User.getPublicProfile(id);
	if (!profile) return res.status(404).json({ error: 'Profile not found' });

	// Get all other informations
	const like = await UserLike.status(self, id);
	const blocked = await UserBlock.status(self, id);
	const images = (await UserPicture.get_images(id)).filter((i) => i.path != '');
	const tags = await UserTag.get_tags(id);
	const languages = await UserLanguage.get_languages(id);
	const history = await UserNotification.getHistory(self, id);
	const userIds = Array.from(new Set(history.map((n) => n.sender)));
	const otherUsers = await User.getAllSimple(userIds);

	// Mark notifications as read
	// profile:visited, like:received and like:match
	const types = [Notification.Visit, Notification.LikeReceived, Notification.LikeMatched];
	const notifications = (await UserNotification.getAnyOf(self, id, types)).map((n) => n.id);
	if (notifications.length > 0) {
		await UserNotification.setListAsRead(notifications);
		const socket = req.app.sockets[self];
		if (socket) {
			console.log('💨[socket]: send notifications/setListAsRead to ', socket.id);
			socket.emit('notifications/setListAsRead', { list: notifications });
		}
	}

	return res.json({
		...profile,
		like,
		blocked,
		images,
		tags,
		languages,
		history: history
			.map((n): NotificationWithUserInterface | undefined => {
				const otherUser = otherUsers.find((user) => user.id == n.sender);
				if (otherUser) return { ...n, user: otherUser };
				return undefined;
			})
			.filter((n) => n !== undefined),
	});
});

export default profileRouter;
