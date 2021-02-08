import express from 'express';
import { Socket } from 'socket.io';
import authToken from '../../middleware/authToken';
import Chat, { ChatInterface } from '../../models/Chat';
import ChatMessage from '../../models/ChatMessage';
import User, { UserSimpleInterface } from '../../models/User';

const chatRouter = express.Router();

// get user
chatRouter.get('/list', authToken, async (req: any, res) => {
	if (!req.user || !req.user.id) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const id = req.user.id;
	// Get all chats
	const chats = await Chat.getAllForUser(id);
	// Get users associated with each chats
	const userIds: number[] = chats.map((chat: ChatInterface) => {
		if (chat.user1 == id) return chat.user2;
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
		const otherUser = id == chat.user1 ? chat.user2 : chat.user1;
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
	if (!req.user || !req.user.id) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const id = req.user.id;

	// Check if the Chat is for the User
	const chat = await Chat.get(req.params.id);
	if (!chat) return res.status(404).json({ error: 'Chat not found' });
	if (chat.user1 != id && chat.user2 != id) return res.status(401).json({ error: 'Unauthorized Chat' });

	// Get all messages
	const messages = await ChatMessage.getAll(chat.id);
	return res.json({ chat, messages });
});

export async function sendMessage(app: Express, socket: Socket, payload: { chat: number; message: string }) {
	// Check if it's a valid message
	if (typeof payload.chat !== 'number' || typeof payload.message !== 'string') {
		return socket.emit('chat/messageError', { error: 'Invalid payload' });
	}
	if (!payload.message) return socket.emit('chat/messageError', { error: 'Empty message' });
	const user = app.users[socket.id];
	if (!user) return socket.emit('chat/messageError', { error: 'Invalid user' });
	const chat = await Chat.get(payload.chat);
	if (!chat) return socket.emit('chat/messageError', { error: 'Invalid chat' });
	if (chat.user1 != user && chat.user2 != user) {
		return socket.emit('chat/messageError', { error: 'Unauthorized chat' });
	}

	// Save the message
	const queryResult = await ChatMessage.add({ chat: chat.id, sender: user, content: payload.message });
	if (queryResult === false) {
		return socket.emit('chat/messageError', { error: 'Could not save message' });
	}
	const chatMessage = await ChatMessage.get(queryResult.insertId);
	// Update lastMessage
	await Chat.updateLastMessage(chat.id);

	// Send the message
	const otherUser = chat.user1 == user ? chat.user2 : chat.user1;
	if (app.sockets[otherUser]) {
		console.log('💨[socket]: send chat/receiveMessage to ', app.sockets[otherUser].id);
		app.sockets[otherUser]!.emit('chat/receiveMessage', chatMessage);
	}
	console.log('💨[socket]: send chat/receiveMessage to ', app.sockets[user].id);
	app.sockets[user]!.emit('chat/receiveMessage', chatMessage);
}

export default chatRouter;
