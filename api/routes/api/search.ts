import express from 'express';
import authToken from '../../middleware/authToken';
import User from '../../models/User';
import { xy2ll } from '../../services/Location';

const searchRouter = express.Router();

// TODO : validate filter
searchRouter.get('/', authToken, async (req: any, res) => {
	try {
		const query: { age?: [string, string]; distance?: string; likes?: string; tags?: string[] } = req.query;
		if (!query || !query.age || !query.distance || !query.likes) throw 'Invalid query';
		if (!query.tags) query.tags = [];
		const users = await User.search(
			req.user.id,
			query.age.map((s) => parseInt(s)),
			parseInt(query.distance),
			parseInt(query.likes),
			query.tags
		);
		return res.json({ users: users.map((u: any) => ({ ...u, location: xy2ll(u.location) })) });
	} catch (error) {
		console.error(error);
		res.status(400);
	}
});

export default searchRouter;
