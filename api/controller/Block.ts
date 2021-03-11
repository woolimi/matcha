import { Response } from 'express';
import Chat from '../models/Chat';
import User from '../models/User';
import UserBlock from '../models/UserBlock';
import UserLike, { UserLikeStatus } from '../models/UserLike';
import UserNotification from '../models/UserNotification';

export default class BlockController {
	static async list(req: any, res: Response) {
		const user = req.user.id as number;
		const blocked = await UserBlock.getAll(user);
		const userIds = Array.from(new Set(blocked.map((block) => block.blocked)));
		const otherUsers = await User.getAllSimple(userIds);
		res.json(
			blocked
				.map((block) => {
					const otherUser = otherUsers.find((user) => user.id == block.blocked);
					if (otherUser) return { id: block.id, at: block.at, user: otherUser };
					return undefined;
				})
				.filter((n) => n !== undefined)
		);
	}

	static async triggerBlockEffects(app: Express, self: number, otherUser: number) {
		// Remove likes
		const likeStatus = await UserLike.status(self, otherUser);
		if (likeStatus != UserLikeStatus.NONE) {
			await UserLike.removeAll(self, otherUser);
			// Decrease fame
			if (likeStatus == UserLikeStatus.TWOWAY) {
				await User.updateFame(self, -10);
				await User.updateFame(otherUser, -10);
			} else if (likeStatus == UserLikeStatus.ONEWAY) {
				await User.updateFame(otherUser, -4);
			} else if (likeStatus == UserLikeStatus.REVERSE) {
				await User.updateFame(self, -4);
			}
		}

		// Delete Chat
		const chat = await Chat.getForUser(self, otherUser);
		if (chat) await Chat.delete(chat.id);
		// Remove all notifications
		await UserNotification.removeAllForUser(self, otherUser);
		await UserNotification.removeAllForUser(otherUser, self);

		// Send blocked if the other is currently looking at our profile
		const otherSocket = app.sockets[otherUser];
		if (otherSocket) {
			const otherUserPage = app.currentPage[otherSocket.id];
			if (
				(otherUserPage &&
					otherUserPage.name == 'app-users-id' &&
					parseInt(otherUserPage.params?.id ?? '') == self) ||
				likeStatus != UserLikeStatus.NONE
			) {
				console.log('💨[socket]: send blockedBy to ', otherSocket.id);
				otherSocket.emit('blockedBy', { user: self });
			}
		}
	}

	static async block(req: any, res: Response) {
		// Check if :id exists
		const id = parseInt(req.params.id);
		const self = parseInt(req.user.id);
		if (isNaN(id) || id < 1 || !(await User.exists(id))) {
			return res.status(404).json({ error: 'Profile not found' });
		}

		const userBlockId = await UserBlock.status(self, id);
		// Unblock User
		if (userBlockId) {
			const result = await UserBlock.remove(userBlockId);
			if (!result) {
				return res.status(500).json({ error: 'Could not change User block state.' });
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
			const result = await UserBlock.add(self, id);
			this.triggerBlockEffects(req.app, self, id);
			const user = await User.getSimple(id);
			return res.json({ id: result.insertId, at: new Date(), status: true, user });
		}
	}
}
