import express from 'express';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';
import Chat from '../../models/Chat';
import User, { UserSimpleInterface } from '../../models/User';
import UserLike, { UserLikeStatus } from '../../models/UserLike';
import UserNotification, { Notification } from '../../models/UserNotification';

const likeRouter = express.Router();

likeRouter.post('/:id', authToken, requireNotSelf, async (req: any, res) => {
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
		const notificationType = status == UserLikeStatus.NONE ? Notification.LikeReceived : Notification.LikeMatched;
		const notifInsert = await UserNotification.add(id, self, notificationType);
		if (!notifInsert) {
			return res.status(500).send({ error: 'Could not insert a new notification.' });
		}

		// Send messages to the other User
		const chat = await Chat.getForUser(self, id);
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			// Send Chat and enable it directly if it already exists
			if (chat && status == UserLikeStatus.REVERSE) {
				const user = (await User.getSimple(self)) as UserSimpleInterface;
				user.online = req.app.sockets[self] != undefined;
				console.log('💨[socket]: send chat/addToList to ', otherSocket.id);
				otherSocket.emit('chat/addToList', { ...chat, user });
			}
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

		// Send chat to ourself directly if it already exists
		const socket = req.app.sockets[self];
		if (socket && chat) {
			const user = (await User.getSimple(id)) as UserSimpleInterface;
			user.online = req.app.sockets[id] != undefined;
			console.log('💨[socket]: send chat/addToList to ', socket.id);
			socket.emit('chat/addToList', { ...chat, user });
		}

		return res.send({ like: status == UserLikeStatus.NONE ? UserLikeStatus.ONEWAY : UserLikeStatus.TWOWAY });
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
			return res.status(500).send({ error: 'Could not insert a new notification.' });
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
		return res.send({ like: status == UserLikeStatus.TWOWAY ? UserLikeStatus.REVERSE : UserLikeStatus.NONE });
	}
});

export default likeRouter;
