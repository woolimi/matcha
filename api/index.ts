import express from 'express';
import cors from 'cors';
import profileRouter from './routes/api/profile';
import authRouter from './routes/auth';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import checkRouter from './routes/api/check';
import path from 'path';
import Database from './init/Database';
import { createServer } from 'http';
import { Server as WSServer } from 'socket.io';
import notificationsRouter from './routes/api/notifications';
import chatRouter from './routes/api/chat';
import requestIp from 'request-ip';
import tagRouter from './routes/api/tags';
import { bindSocket } from './services/Socket';
import searchRouter from './routes/api/search';
import likeRouter from './routes/api/like';
import blockRouter from './routes/api/block';
import reportRouter from './routes/api/report';

dotenv.config();
const corsConfig = {
	origin: [process.env.APP || 'http://localhost:3000'],
	credentials: true,
};

const app = express() as Express;
app.users = {};
app.sockets = {};
app.currentPage = {};

Database.init();
const upload_path =
	process.env.ENVIRONMENT === 'build' || process.env.ENVIRONMENT === 'prod'
		? path.resolve(__dirname, '..', 'uploads')
		: path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(upload_path));
app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(requestIp.mw());
app.set('view engine', 'ejs');

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
app.get('/', (req, res) => {
	return res.json({ status: 'API Server is running' });
});

// Start !
const server = createServer(app);
const io = new WSServer(server, {
	cors: {
		origin: [process.env.APP || 'http://localhost:3000'],
		methods: ['GET', 'POST'],
		credentials: true,
	},
});
bindSocket(app, io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at ${process.env.API}`);
});
