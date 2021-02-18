import express from 'express';
import authToken from '../../middleware/authToken';
import notSelf from '../../middleware/requireNotSelf';
import User from '../../models/User';
import UserLike, { UserLikeStatus } from '../../models/UserLike';
import UserNotification, { Notification } from '../../models/UserNotification';

const likeRouter = express.Router();

likeRouter.post('/:id', authToken, notSelf, async (req: any, res) => {
	// Check if :id existst
	const id = parseInt(req.params.id);
	const self = parseInt(req.user.id);
	if (!(await User.exists(req.params.id))) {
		return res.status(404).json({ error: 'Profile not found' });
	}

	// Get current like status
	const status = await UserLike.status(self, id);

	// Add like from self to id
	if (status == UserLikeStatus.NONE || status == UserLikeStatus.REVERSE) {
		await UserLike.add(self, id);

		// Add notification
		const notificationType = status == UserLikeStatus.NONE ? Notification.LikeReceived : Notification.LikeMatched;
		const notifInsert = await UserNotification.add(id, self, notificationType);
		if (!notifInsert) {
			return res.status(500).send({ error: 'Could not insert a new notification.' });
		}

		// Send notification if the User is logged in
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			const notification = await UserNotification.get(notifInsert.insertId);
			const user = await User.getSimple(self);
			console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
			otherSocket.emit('notifications/receive', { ...notification, user });
		}
		return res.send({ like: status == UserLikeStatus.NONE ? UserLikeStatus.ONEWAY : UserLikeStatus.TWOWAY });
	}
	// Remove like from self to id
	else {
		await UserLike.remove(self, id);

		// Add notification
		const notifInsert = await UserNotification.add(id, self, Notification.LikeRemoved);
		if (!notifInsert) {
			return res.status(500).send({ error: 'Could not insert a new notification.' });
		}

		// Send notification if the User is logged in
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			const notification = await UserNotification.get(notifInsert.insertId);
			const user = await User.getSimple(self);
			console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
			otherSocket.emit('notifications/receive', { ...notification, user });
		}
		return res.send({ like: status == UserLikeStatus.TWOWAY ? UserLikeStatus.REVERSE : UserLikeStatus.NONE });
	}
});

export default likeRouter;
