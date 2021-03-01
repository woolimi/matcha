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
class UserTag extends Model_1.default {
    static init() {
        return Model_1.default.init('user_tags', UserTag);
    }
    static get_tags(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield UserTag.query('SELECT tags.name AS name FROM user_tags \
				LEFT JOIN users ON user_tags.user = users.id \
				LEFT JOIN tags ON user_tags.tag = tags.id \
				WHERE user_tags.user = ?', [user_id]);
                return rows.map((tag) => tag.name);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static add_tag(user_id, tag_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield UserTag.query('INSERT IGNORE INTO user_tags (`user`, `tag`) VALUES (?, ?)', [user_id, tag_id]);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
UserTag.tname = 'user_tags';
UserTag.table = `CREATE TABLE user_tags (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			tag INT UNSIGNED NOT NULL,
			added DATETIME DEFAULT NOW(),
			UNIQUE KEY user_tag_UNIQUE (user, tag),
			FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE,
			FOREIGN KEY (tag) REFERENCES tags (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = UserTag;
//# sourceMappingURL=UserTag.js.map