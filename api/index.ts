import express, { Express as CoreExpress } from 'express';
import cors from 'cors';
import usersRouter from './routes/api/users';
import authRouter from './routes/auth';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import checkRouter from './routes/api/check';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import Database from './init/Database';
import { createServer } from 'http';
import { Server as WSServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import chatRouter, { sendMessage } from './routes/api/chat';

declare global {
	interface Express extends CoreExpress {
		users: { [key: string]: number };
		sockets: { [key: number]: Socket };
	}
}

const serverLog = fs.createWriteStream(path.join(__dirname, '/log/server.log'), { flags: 'a' });

dotenv.config();
const app = express() as Express;
app.users = {};
app.sockets = {};

Database.init();
app.use(morgan('dev', { stream: serverLog }));
app.use(express.json());
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);
app.use(cookieParser());

// API
app.use('/check', checkRouter);
app.use('/api/users', usersRouter);
app.use('/api/users/chat', chatRouter);
app.use('/auth', authRouter);

// Start !
const server = createServer(app);
const io = new WSServer(server, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
		credentials: true,
	},
});
io.on('connection', (socket: Socket) => {
	console.log('💨[socket]: connected', socket.id);
	socket.on('login', (payload: { token: string }) => {
		if (!payload || !payload.token) {
			socket.emit('login response', { error: true });
			return;
		}
		// 'Bearer {token}'
		const token = payload.token.split(' ')[1] ?? '';
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
			if (err) {
				socket.emit('login response', { error: true });
			} else {
				// console.log('linked user', user, 'to socket', socket.id);
				app.users[socket.id] = user.id;
				app.sockets[user.id] = socket;
				socket.emit('login response', { success: true });
			}
		});
	});
	socket.on('chat/sendMessage', (payload) => {
		console.log('💨[socket]: receive chat/sendMessage from', socket.id);
		sendMessage(app, socket, payload);
	});
	socket.on('disconnect', () => {
		console.log('💨[socket]: disconnected', socket.id);
		delete app.sockets[app.users[socket.id]];
		delete app.users[socket.id];
	});
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
