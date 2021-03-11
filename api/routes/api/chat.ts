import express from 'express';
import { Socket } from 'socket.io';
import ChatController from '../../controller/Chat';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';
import Chat from '../../models/Chat';
import ChatMessage from '../../models/ChatMessage';
import User from '../../models/User';
import UserLike, { UserLikeStatus } from '../../models/UserLike';
import UserNotification, { Notification } from '../../models/UserNotification';

const chatRouter = express.Router();

// get user
chatRouter.get('/list', authToken, ChatController.list);
chatRouter.post('/create/:id', authToken, requireNotSelf, ChatController.create);
// Get a chat ID from an User ID
// 	Used to redirect from a notification where there is no Chat ID
chatRouter.get('/user/:id', authToken, requireNotSelf, ChatController.getChat);
chatRouter.get('/:id/:from?', authToken, ChatController.getMessages);

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
