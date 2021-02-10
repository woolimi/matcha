import express from 'express';
import authToken from '../../middleware/authToken';
import User, { UserSimpleInterface } from '../../models/User';
import UserNotification, { NotificationInterface } from '../../models/UserNotification';

type NotificationWithUserInterface = NotificationInterface | { user: UserSimpleInterface };

const notificationRouter = express.Router();

notificationRouter.get('/list', authToken, async (req: any, res) => {
	const id = req.user.id as number;
	const notifications = await UserNotification.getAll(id);
	const otherUsers = await User.getAllSimple(notifications.map((notification) => notification.sender));
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

export default notificationRouter;
