import express from 'express';
import authToken from '../../middleware/authToken';
import { upload } from '../../middleware/multer';
import validator from '../../middleware/validator';
import ProfileController from '../../controller/Profile';

const profileRouter = express.Router();
profileRouter.put(
	'/images/:user_id/:image_id',
	authToken,
	validator.userPictures,
	upload.single('image'),
	ProfileController.uploadPicture
);
profileRouter.post('/images/:user_id/:image_id', authToken, validator.userPictures, ProfileController.deletePicture);
profileRouter.post(
	'/send-email-verification',
	authToken,
	validator.userEmailVerification,
	ProfileController.sendVerificationMail
);
profileRouter.post('/location', authToken, validator.userLocation, ProfileController.updateLocation);
profileRouter.post('/public-info', authToken, validator.userPublic, ProfileController.updatePublicProfile);
profileRouter.post('/change-password', authToken, validator.userChangePassword, ProfileController.changePassword);
profileRouter.get('/:id', authToken, ProfileController.getPublicProfile);
export default profileRouter;
