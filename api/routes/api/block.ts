import express from 'express';
import BlockController from '../../controller/Block';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';

const blockRouter = express.Router();
blockRouter.get('/list', authToken, BlockController.list);
blockRouter.post('/:id', authToken, requireNotSelf, BlockController.block);
export default blockRouter;
