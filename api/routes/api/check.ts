import express from 'express';
import CheckController from '../../controller/Check';

const checkRouter = express.Router();
checkRouter.post('/email', CheckController.checkEmail);
checkRouter.post('/username', CheckController.checkUsername);
export default checkRouter;
