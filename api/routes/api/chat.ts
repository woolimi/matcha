import express from 'express';
import authToken from '../../middleware/authToken';
import Chat from '../../models/Chat';
import User, { UserSimpleInterface } from '../../models/User';

interface ChatInterface {
	id: number;
	user1: number;
	user2: number;
	start: string;
	last: string | null;
}

const chatRouter = express.Router();

// get user
chatRouter.get('/list', authToken, async (req: any, res) => {
	if (!req.user || !req.user.id) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const id = req.user.id;
	// Get all chats
	const chats = await Chat.getAllForUser(id);
	// Get users associated with each chats
	const userIds: number[] = chats.map((chat: ChatInterface) => {
		if (chat.user1 == id) return chat.user2;
		return chat.user1;
	});
	const simpleUsers = await User.getAllSimple(userIds);
	const users: { [key: number]: UserSimpleInterface } = {};
	for (const user of simpleUsers) {
		users[user.id] = user;
	}

	// Construct result object
	const result = [];
	for (const chat of chats) {
		const otherUser = id == chat.user1 ? chat.user2 : chat.user1;
		result.push({
			id: chat.id,
			start: chat.start,
			last: chat.last,
			user: users[otherUser],
		});
	}
	res.send(result);
});

export default chatRouter;
