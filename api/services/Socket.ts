import { Server, Socket } from 'socket.io';
import { sendMessage } from '../routes/api/chat';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat';
import User from '../models/User';

const enum Status {
	'Logout',
	'Login',
}

async function sendStatusChange(status: Status, app: Express, user: number) {
	const chats = await Chat.getAll(user);
	for (const chat of chats) {
		const otherUser = chat.user1 == user ? chat.user2 : chat.user1;
		if (app.sockets[otherUser]) {
			app.sockets[otherUser].emit(status == Status.Logout ? 'userLogout' : 'userLogin', { user });
		}
	}
}

export function bindSocket(app: Express, io: Server) {
	io.on('connection', (socket: Socket) => {
		console.log('💨[socket]: connected', socket.id);
		socket.on('socket/login', (payload: { token: string }, callback) => {
			if (!payload || !payload.token) {
				return callback({ error: true });
			}
			// 'Bearer {token}'
			const token = payload.token.split(' ')[1] ?? '';
			jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err: any, user: any) => {
				if (err) {
					callback({ error: true });
				} else {
					console.log('💨[socket]: linked user', user.id, 'to socket', socket.id);
					app.users[socket.id] = user.id;
					app.sockets[user.id] = socket;
					callback({ success: true });

					// Update login status to all liked users
					await User.updateLastLogin(user.id);
					sendStatusChange(Status.Login, app, user.id);
					for (const socketId of Object.keys(app.currentPage)) {
						if (
							app.currentPage[socketId].name == 'app-users-id' &&
							parseInt(app.currentPage[socketId].params?.id ?? '') == user.id
						) {
							const otherUser = app.users[socketId];
							if (!otherUser) continue;
							const otherSocket = app.sockets[otherUser];
							if (!otherSocket) continue;
							otherSocket.emit('userLogin', { user: user.id });
						}
					}
				}
			});
		});
		socket.on('chat/sendMessage', (payload) => {
			console.log('💨[socket]: receive chat/sendMessage from', socket.id);
			sendMessage(app, socket, payload);
		});
		socket.on('user/changePage', (payload: { name: string; params: { id?: string } }) => {
			console.log('💨[socket]: receive user/changePage from', socket.id);
			app.currentPage[socket.id] = payload;
		});
		socket.on('disconnect', async () => {
			console.log('💨[socket]: disconnected', socket.id);

			const userId = app.users[socket.id];
			const lastLogin = new Date();
			await User.updateLastLogin(userId);
			sendStatusChange(Status.Logout, app, userId);
			for (const socketId of Object.keys(app.currentPage)) {
				if (
					app.currentPage[socketId].name == 'app-users-id' &&
					parseInt(app.currentPage[socketId].params?.id ?? '') == userId
				) {
					const otherUser = app.users[socketId];
					if (!otherUser) continue;
					const otherSocket = app.sockets[otherUser];
					if (!otherSocket) continue;
					otherSocket.emit('userLogout', { user: userId });
				}
			}

			delete app.sockets[userId];
			delete app.users[socket.id];
			delete app.currentPage[socket.id];
		});
	});
}
