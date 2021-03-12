import express from 'express';
import LikeController from '../../controller/Like';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';

const likeRouter = express.Router();
likeRouter.post('/:id', authToken, requireNotSelf, LikeController.like);
export default likeRouter;
