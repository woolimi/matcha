import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import usersRouter from './routes/api/users';
import authRouter from './routes/auth';
import dotenv from 'dotenv';
import MySQL from './init/MySQL';
import cookieParser from 'cookie-parser';
import authToken from './middleware/authToken';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

MySQL.init();

app.use(express.json());
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);
app.use(cookieParser());

// api
app.use('/api/users', usersRouter);
app.use('/auth', authRouter);

app.get('/test', authToken, (req: Request, res: Response) => {
	res.json({ hi: 'hi' });
});

app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
