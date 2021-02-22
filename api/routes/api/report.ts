import express from 'express';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';
import Chat from '../../models/Chat';
import User from '../../models/User';
import UserLike, { UserLikeStatus } from '../../models/UserLike';
import UserNotification from '../../models/UserNotification';
import UserReport from '../../models/UserReport';

const reportRouter = express.Router();

reportRouter.post('/:id', authToken, requireNotSelf, async (req: any, res) => {
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
			return res.status(500).send({ error: 'Could not remove report.' });
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
		const likeStatus = await UserLike.status(self, id);
		if (likeStatus != UserLikeStatus.NONE) {
			await UserLike.removeAll(self, id);
			// Decrease fame
			if (likeStatus == UserLikeStatus.TWOWAY) {
				await User.updateFame(self, -10);
				await User.updateFame(id, -10);
			} else if (likeStatus == UserLikeStatus.ONEWAY) {
				await User.updateFame(id, -4);
			} else if (likeStatus == UserLikeStatus.REVERSE) {
				await User.updateFame(self, -4);
			}
		}
		const result = await UserReport.add(self, id);
		if (!result) {
			return res.status(500).send({ error: 'Could not create report.' });
		}

		// Delete Chat
		const chat = await Chat.getForUser(self, id);
		if (chat) await Chat.delete(chat.id);
		// Remove all notifications
		await UserNotification.removeAllForUser(self, id);
		await UserNotification.removeAllForUser(id, self);

		// Send blocked if the other is currently looking at our profile
		// There is no reportedBy/unreportedBy messages since they don't have a different effect from blockedBy/unblockedBy
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			const otherUserPage = req.app.currentPage[otherSocket.id];
			if (
				(otherUserPage && otherUserPage.name == 'app-users-id' && otherUserPage.params?.id == self) ||
				likeStatus != UserLikeStatus.NONE
			) {
				console.log('💨[socket]: send blockedBy to ', otherSocket.id);
				otherSocket.emit('blockedBy', { user: self });
			}
		}

		return res.send({ id: result.insertId, at: new Date(), status: true });
	}
});

export default reportRouter;
