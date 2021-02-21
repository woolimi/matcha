import express from 'express';
import { Socket } from 'socket.io';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';
import Chat from '../../models/Chat';
import ChatMessage from '../../models/ChatMessage';
import User, { UserSimpleInterface } from '../../models/User';
import UserLike, { UserLikeStatus } from '../../models/UserLike';
import UserNotification, { Notification } from '../../models/UserNotification';

const chatRouter = express.Router();

// get user
chatRouter.get('/list', authToken, async (req: any, res) => {
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
	res.send(result);
});

chatRouter.post('/create/:id', authToken, requireNotSelf, async (req: any, res) => {
	const id = req.params.id as number;
	const self = req.user.id as number;

	// Check User
	if (isNaN(id) || id < 1) {
		return res.status(404).send({ error: 'User not found' });
	}
	const otherUser = await User.getSimple(id);
	if (!otherUser) {
		return res.status(404).send({ error: 'User not found' });
	}

	// Check permissions
	const like = await UserLike.status(self, id);
	if (like != UserLikeStatus.TWOWAY) {
		return res.status(400).send({ error: 'Both Users need to like each other to create a Chat' });
	}

	// Check if the Chat is for the User
	let chat = await Chat.getForUser(id, self);
	let created = false;
	if (!chat) {
		const insert = await Chat.create(self, id);
		if (!insert) {
			return res.status(500).send({ error: 'Could not create a Chat.' });
		}
		chat = { id: insert.insertId, user1: self, user2: id, start: new Date().toISOString(), last: null };
		created = true;
	}

	// Send messages
	const socket = req.app.sockets[self];
	if (socket) {
		otherUser.online = req.app.sockets[id] != undefined ? true : otherUser.login ?? false;
		console.log('💨[socket]: send chat/addToList to ', socket.id);
		socket.emit('chat/addToList', { ...chat, otherUser });
	}
	const otherSocket = req.app.sockets[id];
	if (otherSocket) {
		const user = (await User.getSimple(self)) as UserSimpleInterface;
		user.online = req.app.sockets[self] != undefined ? true : user.login ?? false;
		console.log('💨[socket]: send chat/addToList to ', otherSocket.id);
		otherSocket.emit('chat/addToList', { ...chat, user });
	}
	return res.status(created ? 201 : 200).json({ chat: chat.id });
});

chatRouter.get('/user/:id', authToken, requireNotSelf, async (req: any, res) => {
	const id = parseInt(req.user.id);

	// Check User
	if (isNaN(id) || id < 1) {
		return res.status(404).send({ error: 'User not found' });
	}

	// Check if the Chat is for the User
	const chat = await Chat.getForUser(id, req.params.id);
	if (!chat) {
		return res.status(404).send({ error: 'No Chat found with this user' });
	}

	return res.json(chat);
});

// Get a chat ID from an User ID
// Used to redirect from a notification where there is no Chat ID
chatRouter.get('/:id/:from?', authToken, async (req: any, res) => {
	const self = parseInt(req.user.id);
	const id = parseInt(req.params.id);

	// Check if the Chat exists
	if (isNaN(id) || id < 1) {
		return res.status(404).send({ error: 'Chat not found' });
	}

	// Check if the Chat is for the User
	const chat = await Chat.get(id);
	if (!chat) return res.status(404).json({ error: 'Chat not found' });
	if (chat.user1 != self && chat.user2 != self) return res.status(401).json({ error: 'Unauthorized Chat' });

	// Check permissions
	const userId = chat.user1 == self ? chat.user2 : chat.user1;
	const like = await UserLike.status(self, userId);
	if (like != UserLikeStatus.TWOWAY) {
		return res.status(401).send({ error: 'Both Users need to like each other to Chat' });
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
});

export async function sendMessage(app: Express, socket: Socket, payload: { chat: number; message: string }) {
	// Check if it's a valid message
	if (typeof payload.chat !== 'number' || typeof payload.message !== 'string') {
		return socket.emit('chat/messageError', { error: 'Invalid payload' });
	}
	if (!payload.message) return socket.emit('chat/messageError', { error: 'Empty message' });

	const self = app.users[socket.id];
	if (!self) {
		socket.emit('socket/loggedOut');
		return socket.emit('chat/messageError', { error: 'Invalid user, refresh the page' });
	}

	const chat = await Chat.get(payload.chat);
	if (!chat) return socket.emit('chat/messageError', { error: 'Invalid chat' });
	if (chat.user1 != self && chat.user2 != self) {
		return socket.emit('chat/messageError', { error: 'Unauthorized chat' });
	}

	// Check permissions
	const otherUser = chat.user1 == self ? chat.user2 : chat.user1;
	const like = await UserLike.status(self, otherUser);
	if (like != UserLikeStatus.TWOWAY) {
		return socket.emit('chat/messageError', { error: 'Both Users need to like each other to Chat' });
	}

	// Save the message
	const queryResult = await ChatMessage.add(chat.id, self, payload.message);
	if (queryResult === false) {
		return socket.emit('chat/messageError', { error: 'Could not save message' });
	}
	const chatMessage = await ChatMessage.get(queryResult.insertId);
	// Update lastMessage
	await Chat.updateLastMessage(chat.id);

	// Send the message
	const otherSocket = app.sockets[otherUser];
	if (otherSocket) {
		console.log('💨[socket]: send chat/receiveMessage to ', otherSocket.id);
		otherSocket.emit('chat/receiveMessage', {
			id: queryResult.insertId,
			chat: chat.id,
			sender: self,
			at: new Date(),
			content: payload.message,
		});
	}

	// Send the notification -- only if we're not already in chat or if the user is not logged in
	let addNotification =
		!otherSocket ||
		app.currentPage[otherSocket.id]?.name != 'app-chat-id' ||
		parseInt(app.currentPage[otherSocket.id]?.params?.id ?? '0') != chat.id;
	if (addNotification) {
		// Create a new one if the last one wasn't the exact same
		const lastMessage = await UserNotification.getLastMessage(otherUser, self);
		if (!lastMessage || lastMessage.status) {
			const lastNotification = await UserNotification.getLast(self);
			if (
				!lastNotification ||
				lastNotification.type != Notification.MessageReceived ||
				lastNotification.sender != self ||
				lastNotification.status
			) {
				const notifResult = await UserNotification.add(otherUser, self, Notification.MessageReceived);
				if (notifResult) {
					const currentUser = await User.getSimple(self);
					if (otherSocket) {
						console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
						otherSocket.emit('notifications/receive', {
							id: notifResult.insertId,
							type: Notification.MessageReceived,
							at: new Date(),
							sender: self,
							status: 0,
							user: currentUser,
						});
					}
				}
			}
		}
	}

	console.log('💨[socket]: send chat/receiveMessage to ', socket.id);
	socket.emit('chat/receiveMessage', chatMessage);
}

export default chatRouter;
