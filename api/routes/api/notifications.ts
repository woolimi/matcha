import express from 'express';
import NotificationController from '../../controller/Notification';
import authToken from '../../middleware/authToken';

const notificationRouter = express.Router();
notificationRouter.get('/list', authToken, NotificationController.list);
notificationRouter.post('/read', authToken, NotificationController.markAsRead);
notificationRouter.post('/read/all', authToken, NotificationController.markAllAsRead);
export default notificationRouter;
