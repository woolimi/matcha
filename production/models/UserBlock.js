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
exports.UserBlock = void 0;
const MySQL_1 = __importDefault(require("../init/MySQL"));
const Model_1 = __importDefault(require("./Model"));
const User_1 = __importDefault(require("./User"));
class UserBlock extends Model_1.default {
    static init() {
        return Model_1.default.init('user_blocks', UserBlock);
    }
    static getAll(id) {
        return UserBlock.query(`SELECT * FROM ${UserBlock.tname} WHERE user = ? ORDER BY id DESC`, [id]);
    }
    static status(user, blocked) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserBlock.query(`SELECT id FROM ${UserBlock.tname} WHERE user = ? AND blocked = ? LIMIT 1`, [
                user,
                blocked,
            ]);
            if (result && result.length == 1) {
                return result[0].id;
            }
            return 0;
        });
    }
    static add(user, blocked) {
        return UserBlock.query(`INSERT INTO ${UserBlock.tname} (user, blocked) VALUES (?, ?)`, [user, blocked]);
    }
    static remove(id) {
        return UserBlock.query(`DELETE FROM ${UserBlock.tname} WHERE id = ?`, [id]);
    }
}
exports.UserBlock = UserBlock;
UserBlock.tname = 'user_blocks';
UserBlock.table = `CREATE TABLE user_blocks (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			blocked INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			UNIQUE KEY user_blocked_UNIQUE (user, blocked),
			FOREIGN KEY (user) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (blocked) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = UserBlock;
//# sourceMappingURL=UserBlock.js.map