import { Response } from 'express';
import { SearchQuery } from '../init/Interfaces';
import User from '../models/User';

export default class SearchController {
	static async search(req: any, res: Response) {
		const query: SearchQuery = req.body;
		const users = await User.search(req.user.id, query);
		return res.json({ users });
	}
}
