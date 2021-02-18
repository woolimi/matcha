import express from 'express';
import { Socket } from 'socket.io';
import authToken from '../../middleware/authToken';
import notSelf from '../../middleware/requireNotSelf';
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
		users[user.id] = { ...user, online: req.app.sockets[user.id] != undefined };
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

chatRouter.get('/:id/:from?', authToken, async (req: any, res) => {
	// Check if the Chat is for the User
	const user = req.user.id as number;
	const chat = await Chat.get(req.params.id);
	if (!chat) return res.status(404).json({ error: 'Chat not found' });
	if (chat.user1 != user && chat.user2 != user) return res.status(401).json({ error: 'Unauthorized Chat' });

	// Get all messages -- 20 per page and from "from" if it's present
	const from = req.params.from ? parseInt(req.params.from) : undefined;
	const messages = await ChatMessage.getAllPage(chat.id, from);
	const completed = messages.length < 20;
	if (!from) {
		// Mark last notification as read -- only on the first page
		const otherUser = chat.user1 == user ? chat.user2 : chat.user1;
		const notification = await UserNotification.getLastMessage(user, otherUser);
		if (notification && !notification.status) {
			await UserNotification.setAsRead(notification.id);
		}
		return res.json({ chat, notification: notification?.id, messages, completed });
	}
	return res.json({ messages, completed });
});

chatRouter.post('/create/:id', authToken, notSelf, async (req: any, res) => {
	const id = req.params.id as number;
	const self = req.user.id as number;

	// Check permissions
	const like = await UserLike.status(self, id);
	if (like != UserLikeStatus.TWOWAY) {
		return res.status(400).send({ error: 'Both Users need to like each other to create a Chat' });
	}

	// Check if the Chat is for the User
	const chat = await Chat.getForUser(id, self);
	if (chat) return res.status(200).send({ chat: chat.id });
	const insert = await Chat.create(id, self);
	if (!insert) {
		return res.status(500).send({ error: 'Could not create a Chat.' });
	}

	// Send messages
	const created = { id: insert.insertId, start: new Date(), last: null };
	const socket = req.app.sockets[self];
	if (socket) {
		const user = await User.getSimple(id);
		console.log('💨[socket]: send chat/create to ', socket.id);
		socket.emit('chat/create', { ...created, user });
	}
	const otherSocket = req.app.sockets[id];
	if (otherSocket) {
		const user = await User.getSimple(self);
		console.log('💨[socket]: send chat/create to ', otherSocket.id);
		otherSocket.emit('chat/create', { ...created, user });
	}
	return res.status(201).json({ chat: insert.insertId });
});

chatRouter.get('/user/:id', authToken, async (req: any, res) => {
	const user = req.user.id as number;

	// Check if the Chat is for the User
	const chat = await Chat.getForUser(user, req.params.id);
	if (!chat) {
		return res.status(404).send({ error: 'No Chat found with this user' });
	}

	return res.json(chat);
});

export async function sendMessage(app: Express, socket: Socket, payload: { chat: number; message: string }) {
	// Check if it's a valid message
	if (typeof payload.chat !== 'number' || typeof payload.message !== 'string') {
		return socket.emit('chat/messageError', { error: 'Invalid payload' });
	}
	if (!payload.message) return socket.emit('chat/messageError', { error: 'Empty message' });

	const user = app.users[socket.id];
	if (!user) {
		socket.emit('socket/loggedOut');
		return socket.emit('chat/messageError', { error: 'Invalid user' });
	}

	const chat = await Chat.get(payload.chat);
	if (!chat) return socket.emit('chat/messageError', { error: 'Invalid chat' });
	if (chat.user1 != user && chat.user2 != user) {
		return socket.emit('chat/messageError', { error: 'Unauthorized chat' });
	}

	// Save the message
	const queryResult = await ChatMessage.add(chat.id, user, payload.message);
	if (queryResult === false) {
		return socket.emit('chat/messageError', { error: 'Could not save message' });
	}
	const chatMessage = await ChatMessage.get(queryResult.insertId);
	// Update lastMessage
	await Chat.updateLastMessage(chat.id);

	// Send the message
	const otherUser = chat.user1 == user ? chat.user2 : chat.user1;
	const otherSocket = app.sockets[otherUser];
	if (otherSocket) {
		console.log('💨[socket]: send chat/receiveMessage to ', otherSocket.id);
		otherSocket.emit('chat/receiveMessage', chatMessage);
	}

	// Send the notification -- only if we're not already in chat or if the user is not logged in
	let addNotification =
		!otherSocket ||
		app.currentPage[otherSocket.id]?.name != 'app-chat-id' ||
		parseInt(app.currentPage[otherSocket.id]?.params?.id ?? '0') != chat.id;
	if (addNotification) {
		// Create a new one if the last one wasn't the exact same
		const lastMessage = await UserNotification.getLastMessage(otherUser, user);
		if (!lastMessage || lastMessage.status) {
			const lastNotification = await UserNotification.getLast(user);
			if (
				!lastNotification ||
				lastNotification.type != Notification.MessageReceived ||
				lastNotification.sender != user ||
				lastNotification.status
			) {
				const notifResult = await UserNotification.add(otherUser, user, Notification.MessageReceived);
				if (notifResult) {
					const notification = await UserNotification.get(notifResult.insertId);
					const currentUser = await User.getSimple(user);
					if (otherSocket) {
						console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
						otherSocket.emit('notifications/receive', { ...notification, user: currentUser });
					}
				}
			}
		}
	}

	console.log('💨[socket]: send chat/receiveMessage to ', socket.id);
	socket.emit('chat/receiveMessage', chatMessage);
}

export default chatRouter;
