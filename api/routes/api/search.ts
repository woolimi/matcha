import express from 'express';
import authToken from '../../middleware/authToken';

const searchRouter = express.Router();

searchRouter.get('/', authToken, async (req, res) => {
	try {
		console.log(req.params);
		return res.json(200);
	} catch (error) {
		console.error(error);
		res.status(400);
	}
});

export default searchRouter;
