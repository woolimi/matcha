import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import usersRouter from './routes/api/users';
import authRouter from './routes/auth';
import dotenv from 'dotenv';
import MySQL from './init/MySQL';
import cookieParser from 'cookie-parser';
import authToken from './middleware/authToken';
import checkRouter from './routes/api/check';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const serverLog = fs.createWriteStream(path.join(__dirname, '/log/server.log'), { flags: 'a' });

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

MySQL.init();
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
app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
