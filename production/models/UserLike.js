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
const User_1 = __importDefault(require("./User"));
class UserLike extends Model_1.default {
    static init() {
        return Model_1.default.init('user_likes', UserLike);
    }
    static status(user1, user2) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield UserLike.query(`SELECT * FROM ${UserLike.tname} WHERE (user = ? AND liked = ?) OR (liked = ? AND user = ?) LIMIT 2`, [user1, user2, user1, user2]);
            let likeStatus = 2;
            if (list.length == 0) {
                likeStatus = 0;
            }
            else if (list.length == 1) {
                likeStatus = list[0].user == user1 ? 1 : 3;
            }
            return likeStatus;
        });
    }
    static add(user1, user2) {
        return UserLike.query(`INSERT INTO ${UserLike.tname} (user, liked) VALUES (?, ?)`, [user1, user2]);
    }
    static remove(user1, user2) {
        return UserLike.query(`DELETE FROM ${UserLike.tname} WHERE user = ? AND liked = ?`, [user1, user2]);
    }
    static removeAll(user1, user2) {
        return UserLike.query(`DELETE FROM ${UserLike.tname} WHERE (user = ? AND liked = ?) OR (liked = ? AND user = ?)`, [user1, user2, user1, user2]);
    }
}
UserLike.tname = 'user_likes';
UserLike.table = `CREATE TABLE user_likes (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			liked INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			UNIQUE KEY user_liked_UNIQUE (user, liked),
			FOREIGN KEY (user) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (liked) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = UserLike;
//# sourceMappingURL=UserLike.js.map