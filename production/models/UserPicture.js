"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MySQL_1 = __importDefault(require("../init/MySQL"));
const Model_1 = __importDefault(require("./Model"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class UserPicture extends Model_1.default {
    static init() {
        return Model_1.default.init('user_pictures', UserPicture);
    }
    static create_or_update(user_id, image_id, image_path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let p = null;
                p = yield UserPicture.query('SELECT * FROM user_pictures WHERE path = ? LIMIT 1', [image_path]);
                if (p.length > 0) {
                    return UserPicture.query('UPDATE user_pictures SET added = NOW() WHERE path = ?', [image_path]);
                }
                p = yield UserPicture.query('SELECT * FROM user_pictures WHERE user = ? AND picture = ? LIMIT 1', [
                    user_id,
                    image_id,
                ]);
                if (p.length === 0) {
                    yield UserPicture.query('INSERT INTO `user_pictures` (`user`, `picture`, `path`) VALUES (?, ?, ?)', [
                        user_id,
                        image_id,
                        image_path,
                    ]);
                }
                else {
                    if (!p[0].path.match(/^https:\/\//)) {
                        fs_1.default.unlink(path_1.default.resolve(__dirname, '../', p[0].path), (err) => {
                            if (err)
                                console.log(err);
                        });
                    }
                    yield UserPicture.query('UPDATE user_pictures SET added = NOW(), path = ? WHERE user = ? AND picture = ? ', [image_path, user_id, image_id]);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    static get_images(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const images = yield UserPicture.query('SELECT * FROM user_pictures WHERE user = ?', [user_id]);
                return [0, 1, 2, 3, 4].map((i) => {
                    const img = images.find((img) => img.picture === i);
                    const ret = {
                        url: '',
                        path: '',
                    };
                    if (!img)
                        return ret;
                    if (img.path.match(/^https:\/\//))
                        ret.url = img.path;
                    else if (img.path)
                        ret.url = `${process.env.API}/${img.path}`;
                    ret.path = img.path;
                    return ret;
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    static delete_image(user_id, image_id, image_path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield UserPicture.query('DELETE FROM user_pictures WHERE user = ? AND picture = ?', [user_id, image_id]);
                if (!image_path.match(/^https:\/\//)) {
                    fs_1.default.unlink(path_1.default.resolve(__dirname, '../', image_path), (err) => {
                        if (err)
                            console.log(err);
                    });
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
}
UserPicture.tname = 'user_pictures';
UserPicture.table = `CREATE TABLE user_pictures (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			picture TINYINT NOT NULL,
			path VARCHAR(255) NOT NULL,
			added DATETIME DEFAULT NOW(),
			FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = UserPicture;
//# sourceMappingURL=UserPicture.js.map