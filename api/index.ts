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
import searchRouter from './routes/api/search';
import likeRouter from './routes/api/like';
import blockRouter from './routes/api/block';
import reportRouter from './routes/api/report';

declare global {
	interface Express extends CoreExpress {
		users: { [key: string]: number };
		sockets: { [key: number]: Socket };
		currentPage: { [key: string]: { name: string; params: { id?: string } } };
	}
}

dotenv.config();
const log_path =
	process.env.ENVIRONMENT === 'prod'
		? path.join(__dirname, '..', '/log/server.log')
		: path.join(__dirname, '/log/server.log');
const serverLog = fs.createWriteStream(log_path, { flags: 'a' });
const corsConfig = {
	origin: ['http://localhost:3000', 'http://176.169.89.89', 'https://https://ft-matcha.herokuapp.com/'],
	credentials: true,
};

const app = express() as Express;
app.users = {};
app.sockets = {};
app.currentPage = {};

Database.init();
const upload_path =
	process.env.ENVIRONMENT === 'prod' ? path.resolve(__dirname, '..', 'uploads') : path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(upload_path));
app.use(morgan('dev', { stream: serverLog }));
app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(requestIp.mw());

// API
app.use('/check', checkRouter);
app.use('/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/tags', tagRouter);
app.use('/api/search', searchRouter);
app.use('/api/like', likeRouter);
app.use('/api/block', blockRouter);
app.use('/api/report', reportRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/chat', chatRouter);

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
