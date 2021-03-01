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
class UserLanguage extends Model_1.default {
    static init() {
        return Model_1.default.init('user_languages', UserLanguage);
    }
    static get_languages(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield UserLanguage.query('SELECT language FROM user_languages \
				LEFT JOIN users ON user_languages.user = users.id \
				WHERE user_languages.user = ?', [user_id]);
                return rows.map((l) => l.language);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static add(user_id, language) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield UserLanguage.query('INSERT IGNORE INTO user_languages (`user`, `language`) VALUES (?, ?)', [
                    user_id,
                    language,
                ]);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
UserLanguage.tname = 'user_languages';
UserLanguage.table = `CREATE TABLE user_languages (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			language VARCHAR(50) NOT NULL,
			UNIQUE KEY user_language_UNIQUE (user, language),
			FOREIGN KEY (user) REFERENCES users (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = UserLanguage;
//# sourceMappingURL=UserLanguage.js.map