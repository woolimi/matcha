"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./uploads`);
    },
    filename: function (req, file, cb) {
        const ext = mime_types_1.default.extension(file.mimetype);
        const { user_id, image_id } = req.params;
        cb(null, `${user_id}_${image_id}_${Date.now()}.${ext}`);
    },
});
function fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}
exports.upload = multer_1.default({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 3,
        files: 1,
    },
    fileFilter,
});
//# sourceMappingURL=multer.js.map