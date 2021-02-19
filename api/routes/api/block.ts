import express from 'express';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';
import User from '../../models/User';
import UserBlock from '../../models/UserBlock';
import UserLike from '../../models/UserLike';

const blockRouter = express.Router();

blockRouter.get('/list', authToken, async (req: any, res) => {
	const user = req.user.id as number;
	const blocked = await UserBlock.getAll(user);
	const userIds = Array.from(new Set(blocked.map((block) => block.blocked)));
	const otherUsers = await User.getAllSimple(userIds);
	res.send(
		blocked
			.map((block) => {
				const otherUser = otherUsers.find((user) => user.id == block.blocked);
				if (otherUser) return { id: block.id, at: block.at, user: otherUser };
				return undefined;
			})
			.filter((n) => n !== undefined)
	);
});

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
		const socket = req.app.sockets[self];
		if (socket) {
			console.log('💨[socket]: send unblocked to ', socket.id);
			socket.emit('unblocked', userBlockId);
		}
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			console.log('💨[socket]: send unblockedBy to ', otherSocket.id);
			otherSocket.emit('unblockedBy', { user: self });
		}
	}
	// Block User
	else {
		await UserLike.removeAll(self, id);
		result = await UserBlock.add(self, id);

		// Send notification
		const socket = req.app.sockets[self];
		if (socket) {
			const user = await User.getSimple(id);
			console.log('💨[socket]: send blocked to ', socket.id);
			socket.emit('blocked', { id: result.insertId, at: new Date(), user });
		}
		// Send blocked if the other
		const otherSocket = req.app.sockets[id];
		if (otherSocket) {
			console.log('💨[socket]: send blockedBy to ', otherSocket.id);
			otherSocket.emit('blockedBy', { user: self });
		}
	}

	if (!result) {
		return res.status(500).send({ error: 'Could not change User block state.' });
	}
	return res.send({ blocked: !userBlockId });
});

export default blockRouter;
