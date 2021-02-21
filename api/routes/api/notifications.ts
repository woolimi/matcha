import express from 'express';
import authToken from '../../middleware/authToken';
import User from '../../models/User';
import UserNotification, { NotificationWithUserInterface } from '../../models/UserNotification';

const notificationRouter = express.Router();

notificationRouter.get('/list', authToken, async (req: any, res) => {
	const self = parseInt(req.user.id);
	const notifications = await UserNotification.getAll(self);
	const userIds = Array.from(new Set(notifications.map((notification) => notification.sender)));
	const otherUsers = await User.getAllSimple(userIds);
	res.send(
		notifications
			.map((notification): NotificationWithUserInterface | undefined => {
				const otherUser = otherUsers.find((user) => user.id == notification.sender);
				if (otherUser) return { ...notification, user: otherUser };
				return undefined;
			})
			.filter((n) => n !== undefined)
	);
});

notificationRouter.post('/read', authToken, async (req: any, res) => {
	const id = parseInt(req.body.id);
	if (isNaN(id) || id < 1) {
		return res.status(400).send({ error: 'Missing or invalid notification ID' });
	}

	const notification = await UserNotification.get(id);
	if (!notification) {
		return res.status(400).send({ error: 'Notification does not exists' });
	}

	const result = await UserNotification.setAsRead(id);
	if (!result) {
		return res.status(500).send({ error: 'Could not update the notification' });
	}

	return res.send({ success: true });
});

notificationRouter.post('/read/all', authToken, async (req: any, res) => {
	const result = await UserNotification.setAllAsRead(req.user.id);
	if (!result) return res.status(500).send({ error: 'Could not update the notifications' });
	return res.send({ success: true });
});

export default notificationRouter;
