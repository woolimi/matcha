import { NextFunction, Request, Response } from 'express';

const requireNotSelf = (req: Request, res: Response, next: NextFunction) => {
	const id = parseInt(req.params?.id);
	const self = parseInt((req as any).user?.id);
	if (isNaN(id) || isNaN(self)) res.status(400).json({ error: 'Invalid or missing ID' });
	if (id == self) res.status(400).json({ error: 'You cannot interact with yourself here !' });
	next();
};

export default requireNotSelf;
