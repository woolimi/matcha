import multer from 'multer';
import mime from 'mime-types';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, `./uploads`);
	},
	filename: function (req, file, cb) {
		const ext = mime.extension(file.mimetype);
		const { user_id, image_id } = req.params;
		cb(null, `${user_id}_${image_id}.${ext}`);
	},
});

function fileFilter(req: any, file: any, cb: any) {
	if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
}

export const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024 * 3, // 3MB
		files: 1,
	},
	fileFilter: fileFilter,
});
