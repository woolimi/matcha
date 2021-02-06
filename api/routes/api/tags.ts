import express from 'express';
import authToken from '../../middleware/authToken';
import Tag from '../../models/Tag';

const tagRouter = express.Router();

// get user
tagRouter.get('/', authToken, async (req, res) => {
	try {
		const tags = await Tag.get_tags();
		return res.json({ tags });
	} catch (error) {
		console.error(error);
		res.status(400);
	}
});

export default tagRouter;
