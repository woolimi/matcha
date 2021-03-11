import express from 'express';
import authToken from '../middleware/authToken';
import validator from '../middleware/validator';
import getLocation from '../middleware/getLocation';
import AuthentificationController from '../controller/Authentification';

const authRouter = express.Router();
authRouter.post('/login', validator.userLogin, AuthentificationController.login);
authRouter.post('/refresh', AuthentificationController.refresh);
authRouter.delete('/logout', AuthentificationController.logout);
authRouter.post('/register', validator.userRegister, getLocation, AuthentificationController.register);
authRouter.post('/reset-password', AuthentificationController.resetPassword);
authRouter.post('/social', getLocation, AuthentificationController.socialRegister);
authRouter.get('/email-verification/:jwt', AuthentificationController.verifyEmail);
authRouter.get('/email-verification', AuthentificationController.verifyEmailPage);
authRouter.get('/me', authToken, AuthentificationController.me);
export default authRouter;
