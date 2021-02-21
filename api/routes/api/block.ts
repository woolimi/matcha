import express from 'express';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';
import Chat from '../../models/Chat';
import User from '../../models/User';
import UserBlock from '../../models/UserBlock';
import UserLike, { UserLikeStatus } from '../../models/UserLike';
import UserNotification from '../../models/UserNotification';

const blockRouter = express.Router();

blockRouter.get('/list', authToken, async (req: any, res) => {
	const user = req.user.id as number;
	const blocked = await UserBlock.getAll(user);
	const userIds = Array.from(new Set(blocked.map((block) => block.blocked)));
	const otherUsers = await User.getAllSimple(userIds);
	res.send(
		blocked
			.map((block) => {
				const otherUser = otherUsers.find((user) => user.id == block.blocked);
				if (otherUser) return { id: block.id, at: block.at, user: otherUser };
				return undefined;
			})
			.filter((n) => n !== undefined)
	);
});

blockRouter.post('/:id', authToken, requireNotSelf, async (req: any, res) => {
	// Check if :id existst
	const id = parseInt(req.params.id);
	const self = parseInt(req.user.id);
	if (isNaN(id) || id < 1 || !(await User.exists(id))) {
		return res.status(404).json({ error: 'Profile not found' });
	}

	const userBlockId = await UserBlock.status(self, id);
	let result;
	// Unblock User
	if (userBlockId) {
		result = await UserBlock.remove(userBlockId);
		if (!result) {
			return res.status(500).send({ error: 'Could not change User block state.' });
		}

		// Send unblocked if the other is currently looking at our profile
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			const otherUserPage = req.app.currentPage[otherSocket.id];
			if (otherUserPage && otherUserPage.name == 'app-users-id' && otherUserPage?.params?.id == self) {
				console.log('💨[socket]: send unblockedBy to ', otherSocket.id);
				otherSocket.emit('unblockedBy', { user: self });
			}
		}

		return res.json({ id: userBlockId, status: false });
	}
	// Block User
	else {
		const likeStatus = await UserLike.status(self, id);
		if (likeStatus != UserLikeStatus.NONE) {
			await UserLike.removeAll(self, id);
		}
		result = await UserBlock.add(self, id);
		if (!result) {
			return res.status(500).send({ error: 'Could not change User block state.' });
		}

		// Delete Chat
		const chat = await Chat.getForUser(self, id);
		if (chat) await Chat.delete(chat.id);
		// Remove all notifications
		await UserNotification.removeAllForUser(self, id);
		await UserNotification.removeAllForUser(id, self);

		// Send blocked if the other is currently looking at our profile
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

		const user = await User.getSimple(id);
		return res.send({ id: result.insertId, at: new Date(), status: true, user });
	}
});

export default blockRouter;
