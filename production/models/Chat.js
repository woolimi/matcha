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
const UserBlock_1 = __importDefault(require("./UserBlock"));
const UserLike_1 = __importDefault(require("./UserLike"));
class Chat extends Model_1.default {
    static init() {
        return Model_1.default.init('chats', Chat);
    }
    static get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Chat.query(`SELECT * FROM ${Chat.tname} WHERE id = ?`, [id]);
            if (result && result.length == 1) {
                return result[0];
            }
            return undefined;
        });
    }
    static getForUser(user, otherUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Chat.query(`SELECT * FROM ${Chat.tname} WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?) LIMIT 1`, [user, otherUser, otherUser, user]);
            if (result && result.length == 1) {
                return result[0];
            }
            return undefined;
        });
    }
    static getAll(id) {
        return Chat.query(`SELECT c.* FROM ${Chat.tname} c
			LEFT JOIN ${UserBlock_1.default.tname} ub
				ON (ub.user = c.user1 AND ub.blocked = c.user2)
				OR (ub.user = c.user2 AND ub.blocked = c.user1)
			RIGHT JOIN ${UserLike_1.default.tname} ul1
				ON ul1.user = c.user1 AND ul1.liked = c.user2
			RIGHT JOIN ${UserLike_1.default.tname} ul2
				ON ul2.user = c.user2 AND ul2.liked = c.user1
			WHERE ub.id IS NULL AND (c.user1 = ? OR c.user2 = ?)
			ORDER BY c.id, c.last DESC`, [id, id]);
    }
    static updateLastMessage(id) {
        return Chat.query(`UPDATE ${Chat.tname} SET last = NOW() WHERE id = ?`, [id]);
    }
    static create(user1, user2) {
        return Chat.query(`INSERT INTO ${Chat.tname} (user1, user2) VALUES (?, ?)`, [user1, user2]);
    }
    static delete(id) {
        return Chat.query(`DELETE FROM ${Chat.tname} WHERE id = ?`, [id]);
    }
}
Chat.tname = 'chats';
Chat.table = `CREATE TABLE chats (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user1 INT UNSIGNED NOT NULL,
			user2 INT UNSIGNED NOT NULL,
			start DATETIME DEFAULT NOW(),
			last DATETIME DEFAULT NULL,
			UNIQUE KEY user1_user2_UNIQUE (user1, user2),
			FOREIGN KEY (user1) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (user2) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = Chat;
//# sourceMappingURL=Chat.js.map