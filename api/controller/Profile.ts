import fs from 'fs';
import path from 'path';
import FileType from 'file-type';
import { Response } from 'express';
import Model from '../models/Model';
import User from '../models/User';
import UserBlock from '../models/UserBlock';
import UserLanguage from '../models/UserLanguage';
import UserLike from '../models/UserLike';
import UserNotification, { Notification, NotificationWithUserInterface } from '../models/UserNotification';
import UserPicture from '../models/UserPicture';
import UserReport from '../models/UserReport';
import UserTag from '../models/UserTag';
import { send_verification_email } from '../services/Mailing';

export default class ProfileController {
	static async sendVerificationMail(req: any, res: Response) {
		try {
			const data = req.body;
			await Model.query('START TRANSACTION');
			await User.query('UPDATE users SET email = ?, verified = false WHERE id = ?', [data.email, req.user.id]);
			await send_verification_email(data.email, req.user.id);
			await Model.query('COMMIT');
			return res.json({
				message: 'Email has been sent successfully.',
				email: data.email,
				verified: false,
			});
		} catch (error) {
			console.error(error);
			await Model.query('ROLLBACK');
			return res.sendStatus(400);
		}
	}

	static async updatePublicProfile(req: any, res: Response) {
		await User.updatePublic(req.user.id, req.body);
		return res.status(200).json({ success: 'Profile updated' });
	}

	static async updateLocation(req: any, res: Response) {
		const location = req.body;
		await User.updateLocation(req.user.id, location);
		return res.status(200).json({ success: 'Location updated' });
	}

	static async changePassword(req: any, res: Response) {
		await User.changePassword(req.user.id, req.body);
		return res.status(200).json({ success: 'Password updated' });
	}

	static async uploadPicture(req: any, res: Response) {
		try {
			const fileType = await FileType.fromFile(req.file.path);
			if (!fileType || fileType.mime !== req.file.mimetype) {
				fs.unlink(path.resolve(__dirname, '../../', req.file.path), (err) => {
					if (err) console.log(err);
				});
				return res.status(400).json({ error: 'Invalid image' });
			}
			await UserPicture.create_or_update(req.params.user_id, req.params.image_id, req.file.path);
			const images = await UserPicture.get_images(req.params.user_id);
			return res.json({ images });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Failed to upload picture' });
		}
	}

	static async deletePicture(req: any, res: Response) {
		try {
			await UserPicture.delete_image(req.params.user_id, req.params.image_id, req.body.path);
			return res.status(200).json({ success: 'Picture deleted' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Failed to delete picture' });
		}
	}

	static async getPublicProfile(req: any, res: Response) {
		const self = parseInt(req.user.id);
		const id = parseInt(req.params.id);

		// Check if the ID is valid
		if (isNaN(id) || id < 1) {
			return res.status(404).json({ error: 'Profile not found.' });
		}

		// Check if the user is not blocked or reported
		const isBlocked = await UserBlock.status(id, self);
		const isReported = await UserReport.get(id, self);
		if (isBlocked || isReported) {
			return res.status(401).json({ error: "You can't view this Profile right now." });
		}

		// Get the profile informations
		const profile = await User.getPublicProfile(id);
		if (!profile) return res.status(404).json({ error: 'This Profile does not exists.' });

		// Get all other informations
		const like = await UserLike.status(self, id);
		const blocked = await UserBlock.status(self, id);
		const reported = await UserReport.get(self, id);
		const images = (await UserPicture.get_images(id)).filter((i) => i.path != '');
		const tags = await UserTag.get_tags(id);
		const languages = await UserLanguage.get_languages(id);
		const history = await UserNotification.getHistory(self, id);
		const userIds = Array.from(new Set(history.map((n) => n.sender)));
		const otherUsers = await User.getAllSimple(userIds);

		if (id != self) {
			// TODO: debounce last visit (notification + fame)

			// Increase fame
			await User.updateFame(id, 1);
			profile.fame += 1;

			// Add notification
			const notifInsert = await UserNotification.add(id, self, Notification.Visit);
			if (notifInsert) {
				const otherSocket = req.app.sockets[id];
				if (otherSocket) {
					const currentUser = await User.getSimple(self);
					console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
					otherSocket.emit('notifications/receive', {
						id: notifInsert.insertId,
						type: Notification.Visit,
						at: new Date(),
						sender: self,
						status: 0,
						user: currentUser,
					});
				}
			}

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
		}

		return res.json({
			...profile,
			online: req.app.sockets[id] != undefined ? true : profile.login ?? false,
			like,
			blocked,
			reported: reported != null,
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
	}
}
