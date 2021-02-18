import { NextFunction } from 'express';

const requireNotSelf = (req: any, res: any, next: NextFunction): any => {
	const id = parseInt(req.params?.id);
	const self = parseInt(req.user?.id);
	if (isNaN(id) || isNaN(self)) res.send(400).json({ error: 'Invalid or missing ID' });
	if (id == self) res.send(400).json({ error: 'You cannot interact with yourself here !' });
	next();
};

export default requireNotSelf;
