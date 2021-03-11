import express from 'express';
import TagController from '../../controller/Tag';
import authToken from '../../middleware/authToken';

const tagRouter = express.Router();
tagRouter.get('/', authToken, TagController.list);
export default tagRouter;
