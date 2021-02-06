import express from 'express';
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
import requestIp from 'request-ip';
import tagRouter from './routes/api/tags';

dotenv.config();
const serverLog = fs.createWriteStream(path.join(__dirname, '/log/server.log'), { flags: 'a' });
const corsConfig = {
	origin: ['http://localhost:3000', 'http://176.169.89.89'],
	credentials: true,
};

const app = express();
const PORT = process.env.PORT || 5000;

Database.init();
app.use('/uploads', express.static(__dirname + '/uploads'));
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

// Start !
app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at ${process.env.API}:${PORT}`);
});
