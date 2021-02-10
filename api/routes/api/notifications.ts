import express from 'express';
import authToken from '../../middleware/authToken';
import Chat, { ChatInterface } from '../../models/Chat';
import User, { UserSimpleInterface } from '../../models/User';
import UserNotification from '../../models/UserNotification';

const notificationRouter = express.Router();

notificationRouter.get('/list', authToken, async (req: any, res) => {
	const id = req.user.id as number;
	const notifications = await UserNotification.getAll(id);
	res.send(notifications);
});

export default notificationRouter;
