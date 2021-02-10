import express, { Express as CoreExpress } from 'express';
import cors from 'cors';
import profileRouter from './routes/api/profile';
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
import notificationsRouter from './routes/api/notifications';
import chatRouter from './routes/api/chat';
import requestIp from 'request-ip';
import tagRouter from './routes/api/tags';
import { bindSocket } from './services/Socket';

declare global {
	interface Express extends CoreExpress {
		users: { [key: string]: number };
		sockets: { [key: number]: Socket };
	}
}

dotenv.config();
const serverLog = fs.createWriteStream(path.join(__dirname, '/log/server.log'), { flags: 'a' });
const corsConfig = {
	origin: ['http://localhost:3000', 'http://176.169.89.89'],
	credentials: true,
};

const app = express() as Express;
app.users = {};
app.sockets = {};

Database.init();
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(morgan('dev', { stream: serverLog }));
app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(requestIp.mw());

// API
app.use('/check', checkRouter);
app.use('/api/users/notifications', notificationsRouter);
app.use('/api/users/chat', chatRouter);
app.use('/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/tags', tagRouter);

// Start !
const server = createServer(app);
const io = new WSServer(server, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
		credentials: true,
	},
});
bindSocket(app, io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at ${process.env.API}`);
});
