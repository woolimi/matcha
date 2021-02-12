import express from 'express';
import { ResultSetHeader } from 'mysql2';
import { Socket } from 'socket.io';
import authToken from '../../middleware/authToken';
import Chat from '../../models/Chat';
import ChatMessage from '../../models/ChatMessage';
import User, { UserSimpleInterface } from '../../models/User';
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
chatRouter.get('/:id', authToken, async (req: any, res) => {
	// Check if the Chat is for the User
	const user = req.user.id as number;
	const chat = await Chat.get(req.params.id);
	if (!chat) return res.status(404).json({ error: 'Chat not found' });
	if (chat.user1 != user && chat.user2 != user) return res.status(401).json({ error: 'Unauthorized Chat' });

	// Mark last notification as read
	const otherUser = chat.user1 == user ? chat.user2 : chat.user1;
	const notification = await UserNotification.getLastMessage(user, otherUser);
	if (notification && !notification.status) {
		await UserNotification.setAsRead(notification.id);
	}

	// Get all messages
	const messages = await ChatMessage.getAll(chat.id);
	return res.json({ chat, notification: notification?.id, messages });
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

	const otherUser = chat.user1 == user ? chat.user2 : chat.user1;
	// Add the notification -- only if the last one wasn't the exact same one
	const lastNotification = await UserNotification.getLast(otherUser);
	let notifResult: ResultSetHeader | false = false;
	if (
		!lastNotification ||
		lastNotification.type != Notification.MessageReceived ||
		lastNotification.sender != user ||
		lastNotification.status
	) {
		notifResult = await UserNotification.add(otherUser, user, Notification.MessageReceived);
	}
	// Send the message
	if (app.sockets[otherUser]) {
		console.log('💨[socket]: send chat/receiveMessage to ', app.sockets[otherUser].id);
		app.sockets[otherUser]!.emit('chat/receiveMessage', chatMessage);
		if (notifResult) {
			const notification = await UserNotification.get(notifResult.insertId);
			const currentUser = await User.getSimple(user);
			console.log('💨[socket]: send notification to ', app.sockets[otherUser].id);
			app.sockets[otherUser]!.emit('notification', { ...notification, user: currentUser });
		}
	}
	console.log('💨[socket]: send chat/receiveMessage to ', socket.id);
	socket.emit('chat/receiveMessage', chatMessage);
}

export default chatRouter;
