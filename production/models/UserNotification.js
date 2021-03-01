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
class UserNotification extends Model_1.default {
    static init() {
        return Model_1.default.init('user_notifications', UserNotification);
    }
    static get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserNotification.query(`SELECT * FROM ${UserNotification.tname} WHERE id = ?`, [id]);
            if (result && result.length == 1) {
                return result[0];
            }
            return undefined;
        });
    }
    static getLast(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserNotification.query(`SELECT * FROM ${UserNotification.tname} WHERE user = ? ORDER BY id DESC LIMIT 1`, [user]);
            if (result && result.length == 1) {
                return result[0];
            }
            return undefined;
        });
    }
    static getLastMessage(user, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserNotification.query(`SELECT * FROM ${UserNotification.tname} WHERE user = ? AND sender = ? AND type = '${"message:received"}' ORDER BY id DESC LIMIT 1`, [user, sender]);
            if (result && result.length == 1) {
                return result[0];
            }
            return undefined;
        });
    }
    static getAll(id) {
        return UserNotification.query(`SELECT * FROM ${UserNotification.tname} WHERE user = ? ORDER BY id DESC`, [id]);
    }
    static add(user, sender, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return UserNotification.query(`INSERT INTO ${UserNotification.tname} (user, type, sender) VALUES (?, ?, ?)`, [user, type, sender]);
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    static getHistory(user, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserNotification.query(`SELECT * FROM ${UserNotification.tname} WHERE user = ? AND sender = ? ORDER BY id DESC`, [user, sender]);
            return result;
        });
    }
    static getAnyOf(user1, user2, type) {
        return UserNotification.query(`SELECT id
			FROM ${UserNotification.tname}
			WHERE status = 0 AND user = ? AND sender = ? AND type IN (${new Array(type.length).fill('?').join(',')})`, [user1, user2, ...type]);
    }
    static removeAllForUser(user1, user2) {
        return UserNotification.query(`DELETE FROM ${UserNotification.tname}
			WHERE user = ? AND sender = ?`, [user1, user2]);
    }
    static setAs(id, status) {
        return UserNotification.query(`UPDATE ${UserNotification.tname} SET status = ? WHERE id = ?`, [status, id]);
    }
    static setAsRead(id) {
        return this.setAs(id, true);
    }
    static setListAsRead(ids) {
        return UserNotification.query(`UPDATE ${UserNotification.tname}
			SET status = 1
			WHERE id IN (${new Array(ids.length).fill('?').join(',')})`, [...ids]);
    }
    static setAllAsRead(user) {
        return UserNotification.query(`UPDATE ${UserNotification.tname} SET status = 1 WHERE user = ?`, [user]);
    }
    static setAsUnread(id) {
        return this.setAs(id, false);
    }
}
UserNotification.tname = 'user_notifications';
UserNotification.table = `CREATE TABLE user_notifications (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			type ENUM('profile:visited', 'message:received', 'like:received', 'like:match', 'like:removed') NOT NULL,
			at DATETIME DEFAULT NOW(),
			sender INT UNSIGNED NULL,
			status TINYINT UNSIGNED DEFAULT '0',
			FOREIGN KEY (user) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (sender) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = UserNotification;
//# sourceMappingURL=UserNotification.js.map