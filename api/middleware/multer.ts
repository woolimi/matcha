import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import multer from 'multer';
import mime from 'mime-types';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, `./uploads`);
	},
	filename: function (req, file, cb) {
		const ext = mime.extension(file.mimetype);
		const { user_id, image_id } = req.params;
		cb(null, `${user_id}_${image_id}_${Date.now()}.${ext}`);
	},
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
	if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
		return cb(new Error('Only image files are allowed!'));
	}
	cb(null, true);
}

export const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024 * 3, // 3MB
		files: 1,
	},
	fileFilter,
});
