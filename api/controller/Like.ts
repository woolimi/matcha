import { Response } from 'express';
import { ChatInterface } from '../models/Chat';
import User, { UserSimpleInterface } from '../models/User';
import UserLike, { UserLikeStatus } from '../models/UserLike';
import UserNotification, { Notification } from '../models/UserNotification';
import ChatController from './Chat';

export default class LikeController {
	static async like(req: any, res: Response) {
		// Check if :id existst
		const id = parseInt(req.params.id);
		const self = parseInt(req.user.id);
		if (isNaN(id) || id < 1 || !(await User.exists(req.params.id))) {
			return res.status(404).json({ error: 'Profile not found' });
		}

		// Get current like status
		const status = await UserLike.status(self, id);

		// Add like from self to id
		if (status == UserLikeStatus.NONE || status == UserLikeStatus.REVERSE) {
			await UserLike.add(self, id);

			// Increase fame - 4 on like and 6 on match
			const fameIncrease = status == UserLikeStatus.NONE ? 4 : 10;
			await User.updateFame(id, fameIncrease);
			if (status == UserLikeStatus.REVERSE) {
				await User.updateFame(self, 6);
			}

			// Add notification
			const notificationType =
				status == UserLikeStatus.NONE ? Notification.LikeReceived : Notification.LikeMatched;
			const notifInsert = await UserNotification.add(id, self, notificationType);
			if (!notifInsert) {
				return res.status(500).json({ error: 'Could not insert a new notification.' });
			}

			// Send messages to the other User
			const otherUser = (await User.getSimple(id)) as UserSimpleInterface;
			const otherSocket = req.app.sockets[id];
			if (otherSocket) {
				// Send notification
				const user = await User.getSimple(self);
				console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
				otherSocket.emit('notifications/receive', {
					id: notifInsert.insertId,
					type: notificationType,
					at: new Date(),
					sender: self,
					status: 0,
					user,
				});
			}

			// Create and send chat directly on match
			if (status == UserLikeStatus.REVERSE) {
				const chatResult = ChatController.doCreateChat(req.app, self, otherUser);
				if ('error' in chatResult) {
					return res.json({ like: UserLikeStatus.TWOWAY });
				}
			}

			return res.json({ like: status == UserLikeStatus.NONE ? UserLikeStatus.ONEWAY : UserLikeStatus.TWOWAY });
		}
		// Remove like from self to id
		// if (status == UserLikeStatus.ONEWAY || status == UserLikeStatus.TWOWAY)
		else {
			await UserLike.remove(self, id);

			// Decrease fame - -4 from like and -6 from match
			if (status == UserLikeStatus.TWOWAY) {
				await User.updateFame(id, -10); // Remove match + like
				await User.updateFame(self, -6); // Remove match to self
			} else await User.updateFame(id, -4); // else Remove like to other

			// Add notification
			const notifInsert = await UserNotification.add(id, self, Notification.LikeRemoved);
			if (!notifInsert) {
				return res.status(500).json({ error: 'Could not insert a new notification.' });
			}

			// Send notification if the User is logged in
			const otherSocket = req.app.sockets[id];
			if (otherSocket) {
				const user = await User.getSimple(self);
				console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
				otherSocket.emit('notifications/receive', {
					id: notifInsert.insertId,
					type: Notification.LikeRemoved,
					at: new Date(),
					sender: self,
					status: 0,
					user,
				});
			}
			return res.json({ like: status == UserLikeStatus.TWOWAY ? UserLikeStatus.REVERSE : UserLikeStatus.NONE });
		}
	}
}
