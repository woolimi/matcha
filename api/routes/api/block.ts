import express from 'express';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';
import User from '../../models/User';
import UserBlock from '../../models/UserBlock';
import UserLike, { UserLikeStatus } from '../../models/UserLike';
import UserNotification, { Notification } from '../../models/UserNotification';

const blockRouter = express.Router();

blockRouter.post('/:id', authToken, requireNotSelf, async (req: any, res) => {
	// Check if :id existst
	const id = parseInt(req.params.id);
	const self = parseInt(req.user.id);
	if (!(await User.exists(req.params.id))) {
		return res.status(404).json({ error: 'Profile not found' });
	}

	const userBlockId = await UserBlock.status(self, id);
	let result;
	// Unblock User
	if (userBlockId) {
		result = await UserBlock.remove(userBlockId);

		// Send notification
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			console.log('💨[socket]: send unblocked to ', otherSocket.id);
			otherSocket.emit('unblocked', { from: self });
		}
	}
	// Block User
	else {
		await UserLike.removeAll(self, id);
		result = await UserBlock.add(self, id);

		// Send notification
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			console.log('💨[socket]: send blocked to ', otherSocket.id);
			otherSocket.emit('blocked', { from: self });
		}
	}

	if (!result) {
		return res.status(500).send({ error: 'Could not change User block state.' });
	}
	return res.send({ blocked: !userBlockId });
});

export default blockRouter;
