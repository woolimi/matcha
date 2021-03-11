import { Response } from 'express';
import User from '../models/User';
import UserNotification, { NotificationWithUserInterface } from '../models/UserNotification';

export default class NotificationController {
	static async list(req: any, res: Response) {
		const self = parseInt(req.user.id);
		const notifications = await UserNotification.getAll(self);
		const userIds = Array.from(new Set(notifications.map((notification) => notification.sender)));
		const otherUsers = await User.getAllSimple(userIds);
		res.json(
			notifications
				.map((notification): NotificationWithUserInterface | undefined => {
					const otherUser = otherUsers.find((user) => user.id == notification.sender);
					if (otherUser) return { ...notification, user: otherUser };
					return undefined;
				})
				.filter((n) => n !== undefined)
		);
	}

	static async markAsRead(req: any, res: Response) {
		const id = parseInt(req.body.id);
		if (isNaN(id) || id < 1) {
			return res.status(404).json({ error: 'Missing or invalid notification ID' });
		}

		const notification = await UserNotification.get(id);
		if (!notification) {
			return res.status(404).json({ error: 'Notification does not exists' });
		}

		const result = await UserNotification.setAsRead(id);
		if (!result) {
			return res.status(500).json({ error: 'Could not update the notification' });
		}

		return res.json({ success: true });
	}

	static async markAllAsRead(req: any, res: Response) {
		const result = await UserNotification.setAllAsRead(req.user.id);
		if (!result) return res.status(500).json({ error: 'Could not update the notifications' });
		return res.json({ success: true });
	}
}
