import { Response } from 'express';
import Chat, { ChatInterface } from '../models/Chat';
import User, { UserSimpleInterface } from '../models/User';
import UserLike, { UserLikeStatus } from '../models/UserLike';
import ChatMessage from '../models/ChatMessage';
import UserNotification from '../models/UserNotification';

export default class ChatController {
	static async list(req: any, res: Response) {
		// Get all chats
		const user = req.user.id as number;
		const chats = await Chat.getAll(user);
		// Get users associated with each chats
		const userIds: number[] = chats.map((chat) => {
			if (chat.user1 == user) return chat.user2;
			return chat.user1;
		});
		const simpleUsers = await User.getAllSimple(userIds);
		const users: { [key: number]: UserSimpleInterface } = {};
		for (const user of simpleUsers) {
			const online = req.app.sockets[user.id] != undefined ? true : user.login ?? false;
			users[user.id] = { ...user, online };
		}

		// Construct result object
		const result = [];
		for (const chat of chats) {
			const otherUser = user == chat.user1 ? chat.user2 : chat.user1;
			result.push({
				id: chat.id,
				start: chat.start,
				last: chat.last,
				user: users[otherUser],
			});
		}
		res.json(result);
	}

	static async getChat(req: any, res: Response) {
		const id = parseInt(req.user.id);

		// Check User
		if (isNaN(id) || id < 1) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Check if the Chat is for the User
		const chat = await Chat.getForUser(id, req.params.id);
		if (!chat) {
			return res.status(404).json({ error: 'No Chat found with this user' });
		}

		return res.json(chat);
	}

	static async getMessages(req: any, res: Response) {
		const self = parseInt(req.user.id);
		const id = parseInt(req.params.id);

		// Check if the Chat exists
		if (isNaN(id) || id < 1) {
			return res.status(404).json({ error: 'Chat not found' });
		}

		// Check if the Chat is for the User
		const chat = await Chat.get(id);
		if (!chat) return res.status(404).json({ error: 'Chat not found' });
		if (chat.user1 != self && chat.user2 != self) return res.status(401).json({ error: 'Unauthorized Chat' });

		// Check permissions
		const userId = chat.user1 == self ? chat.user2 : chat.user1;
		const like = await UserLike.status(self, userId);
		if (like != UserLikeStatus.TWOWAY) {
			return res.status(401).json({ error: 'Both Users need to like each other to Chat' });
		}

		// Get all messages -- 20 per page and from "from" if it's present
		let from = req.params.from ? parseInt(req.params.from) : undefined;
		if (!from || isNaN(from)) from = 0;
		const messages = await ChatMessage.getAllPage(chat.id, from);
		const completed = messages.length < 20;
		if (!from) {
			// Mark last notification as read -- only on the first page
			const notification = await UserNotification.getLastMessage(self, userId);
			if (notification && !notification.status) {
				await UserNotification.setAsRead(notification.id);
			}
			return res.json({ chat, notification: notification?.id, messages, completed });
		}
		return res.json({ messages, completed });
	}

	static async doCreateChat(
		app: Express,
		self: number,
		otherUser: UserSimpleInterface
	): Promise<{ created: boolean; chat: ChatInterface } | { error: string }> {
		const id = otherUser.id;

		// Check if the Chat is for the User
		let chat = await Chat.getForUser(id, self);
		let created = false;
		if (!chat) {
			const insert = await Chat.create(self, id);
			if (!insert) {
				return { error: 'Could not create a Chat.' };
			}
			chat = { id: insert.insertId, user1: self, user2: id, start: new Date().toISOString(), last: null };
			created = true;
		}

		// Send messages
		const socket = app.sockets[self];
		if (socket) {
			otherUser.online = app.sockets[id] != undefined ? true : otherUser.login ?? false;
			console.log('💨[socket]: send chat/addToList to ', socket.id);
			socket.emit('chat/addToList', { ...chat, user: otherUser });
		}
		const otherSocket = app.sockets[id];
		if (otherSocket) {
			const user = (await User.getSimple(self)) as UserSimpleInterface;
			user.online = app.sockets[self] != undefined ? true : user.login ?? false;
			console.log('💨[socket]: send chat/addToList to ', otherSocket.id);
			otherSocket.emit('chat/addToList', { ...chat, user });
		}
		return { created, chat };
	}

	static async create(req: any, res: Response) {
		const id = req.params.id as number;
		const self = req.user.id as number;

		// Check User
		if (isNaN(id) || id < 1) {
			return res.status(404).json({ error: 'User not found' });
		}
		const otherUser = await User.getSimple(id);
		if (!otherUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Check permissions
		const like = await UserLike.status(self, id);
		if (like != UserLikeStatus.TWOWAY) {
			return res.status(400).json({ error: 'Both Users need to like each other to create a Chat' });
		}

		// Check if the Chat is for the User
		const result = await ChatController.doCreateChat(req.app, self, otherUser);
		if ('error' in result) {
			return res.status(500).json({ error: result.error });
		}
		return res.status(result.created ? 201 : 200).json({ chat: result.chat.id });
	}
}
