import { Response } from 'express';
import Tag from '../models/Tag';

export default class TagController {
	static async list(req: any, res: Response) {
		const tags = await Tag.get_tags();
		return res.json({ tags });
	}
}
