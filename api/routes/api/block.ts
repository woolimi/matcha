import express from 'express';
import authToken from '../../middleware/authToken';
import User from '../../models/User';
import UserBlock from '../../models/UserBlock';

const blockRouter = express.Router();

blockRouter.post('/:id', authToken, async (req: any, res) => {
	// Check if :id existst
	const id = parseInt(req.params.id);
	const self = parseInt(req.user.id);
	if (id == self) {
		return res.status(400).json({ error: "Huh? You can't block yourself" });
	}
	if (!(await User.exists(req.params.id))) {
		return res.status(404).json({ error: 'Profile not found' });
	}

	const userBlockId = await UserBlock.status(self, id);
	let result;
	// Unblock User
	if (userBlockId) result = await UserBlock.remove(userBlockId);
	// Block User
	else result = await UserBlock.add(self, id);

	if (!result) {
		return res.status(500).send({ error: 'Could not change User block state.' });
	}
	return res.send({ blocked: !userBlockId });
});

export default blockRouter;
