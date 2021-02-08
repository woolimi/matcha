import { Server, Socket } from 'socket.io';
import { sendMessage } from '../routes/api/chat';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat';

const enum Status {
	'Logout',
	'Login',
}

async function sendStatusChange(status: Status, app: Express, user: number) {
	const chats = await Chat.getAllForUser(user);
	for (const chat of chats) {
		const otherUser = chat.user1 == user ? chat.user2 : chat.user1;
		if (app.sockets[otherUser]) {
			app.sockets[otherUser].emit(status == Status.Logout ? 'userLogout' : 'userLogin', { user: user });
		}
	}
}

export function bindSocket(app: Express, io: Server) {
	io.on('connection', (socket: Socket) => {
		console.log('💨[socket]: connected', socket.id);
		socket.on('socket/login', (payload: { token: string }) => {
			if (!payload || !payload.token) {
				socket.emit('socket/loginResponse', { error: true });
				return;
			}
			// 'Bearer {token}'
			const token = payload.token.split(' ')[1] ?? '';
			jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err: any, user: any) => {
				if (err) {
					socket.emit('socket/loginResponse', { error: true });
				} else {
					console.log('💨[socket]: linked user', user.id, 'to socket', socket.id);
					app.users[socket.id] = user.id;
					app.sockets[user.id] = socket;
					socket.emit('socket/loginResponse', { success: true });

					// Update login status to all liked users
					sendStatusChange(Status.Login, app, user.id);
				}
			});
		});
		socket.on('chat/sendMessage', (payload) => {
			console.log('💨[socket]: receive chat/sendMessage from', socket.id);
			sendMessage(app, socket, payload);
		});
		socket.on('disconnect', async () => {
			console.log('💨[socket]: disconnected', socket.id);

			const userId = app.users[socket.id];
			sendStatusChange(Status.Logout, app, userId);

			delete app.sockets[userId];
			delete app.users[socket.id];
		});
	});
}
