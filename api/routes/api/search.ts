import express from 'express';
import authToken from '../../middleware/authToken';
import User from '../../models/User';
import { xy2ll } from '../../services/Location';
import validator from '../../middleware/validator';
import { SearchQuery } from '../../init/Interfaces';

const searchRouter = express.Router();

// TODO : validate filter
searchRouter.get('/', authToken, validator.searchQuery, async (req: any, res) => {
	try {
		const query: SearchQuery = req.query;
		const users = await User.search(req.user.id, query);
		return res.json({
			users,
		});
	} catch (error) {
		console.error(error);
		res.sendStatus(400);
	}
});

export default searchRouter;
