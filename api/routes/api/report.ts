import express from 'express';
import ReportController from '../../controller/Report';
import authToken from '../../middleware/authToken';
import requireNotSelf from '../../middleware/requireNotSelf';

const reportRouter = express.Router();
reportRouter.post('/:id', authToken, requireNotSelf, ReportController.report);
export default reportRouter;
