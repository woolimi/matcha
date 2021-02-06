import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authToken = (req: any, res: any, next: NextFunction): any => {
	const authHeader = req.headers['authorization'];
	if (!authHeader) {
		return res.status(401).json({ error: 'Missing Authorization header' });
	}
	const [type, token] = authHeader.split(' ');
	if (type !== 'Bearer') {
		return res.status(401).json({ error: 'Invalid token type' });
	}
	if (!token) {
		return res.status(401).json({ error: 'Missing token' });
	}
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
		if (err) {
			return res.status(403).json({ error: 'Token expired' });
		}
		req.user = user;
		next();
	});
};

export default authToken;
