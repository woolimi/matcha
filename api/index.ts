import express from 'express';
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
import { Server as WSServer } from 'socket.io';

const serverLog = fs.createWriteStream(path.join(__dirname, '/log/server.log'), { flags: 'a' });

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

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
io.on('connection', (socket) => {
	console.log('connected', socket);
});
server.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
