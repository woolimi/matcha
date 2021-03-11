import { Response } from 'express';
import Chat from '../models/Chat';
import User from '../models/User';
import UserLike, { UserLikeStatus } from '../models/UserLike';
import UserNotification from '../models/UserNotification';
import UserReport from '../models/UserReport';
import BlockController from './Block';

export default class ReportController {
	static async report(req: any, res: Response) {
		// Check if :id exists
		const id = parseInt(req.params.id);
		const self = parseInt(req.user.id);
		if (isNaN(id) || id < 1 || !(await User.exists(id))) {
			return res.status(404).json({ error: 'Profile not found' });
		}

		const userReport = await UserReport.get(self, id);
		// Remove report
		if (userReport) {
			const result = await UserReport.remove(userReport.id);
			if (!result) {
				return res.status(500).json({ error: 'Could not remove report.' });
			}

			// Send unblocked if the other is currently looking at our profile
			// This will trigger a refresh even if the user is also blocked
			const otherSocket = req.app.sockets[id];
			if (otherSocket) {
				const otherUserPage = req.app.currentPage[otherSocket.id];
				if (otherUserPage && otherUserPage.name == 'app-users-id' && otherUserPage?.params?.id == self) {
					console.log('💨[socket]: send unblockedBy to ', otherSocket.id);
					otherSocket.emit('unblockedBy', { user: self });
				}
			}

			return res.json({ id: userReport.id, status: false });
		}
		// Add report
		else {
			const result = await UserReport.add(self, id);
			if (!result) {
				return res.status(500).json({ error: 'Could not create report.' });
			}
			await BlockController.triggerBlockEffects(req.app, self, id);
			return res.json({ id: result.insertId, at: new Date(), status: true });
		}
	}
}
