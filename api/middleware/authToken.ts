import { NextFunction, Router } from "express";
import jwt from "jsonwebtoken";

const authToken = (req: any, res: any, next: NextFunction): any => {
	const authHeader = req.headers["authorization"];
	if (!authHeader) return res.sendStatus(401);
	const [type, token] = authHeader.split(" ");
	if (type !== "Bearer") return res.sendStatus(401);
	if (!token) return res.sendStatus(401);
	jwt.verify(token, process.env.ACESS_TOKEN_SECRET, (err: any, user: any) => {
		if (err) return res.sendStatus(403); // Forbidden, token is expired.
		req.user = user;
		next();
	});
};

export default authToken;
