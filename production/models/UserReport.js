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
class UserReport extends Model_1.default {
    static init() {
        return Model_1.default.init(UserReport.tname, UserReport);
    }
    static get(user, reported) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserReport.query(`SELECT * FROM ${UserReport.tname} WHERE user = ? AND reported = ? LIMIT 1`, [user, reported]);
            if (result && result.length == 1) {
                return result[0];
            }
            return undefined;
        });
    }
    static add(user, reported) {
        return UserReport.query(`INSERT INTO ${UserReport.tname} (user, reported) VALUES (?, ?)`, [user, reported]);
    }
    static remove(id) {
        return UserReport.query(`DELETE FROM ${UserReport.tname} WHERE id = ?`, [id]);
    }
}
UserReport.tname = 'user_reports';
UserReport.table = `CREATE TABLE ${UserReport.tname} (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			user INT UNSIGNED NOT NULL,
			reported INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			UNIQUE KEY user_reported_UNIQUE (user, reported),
			FOREIGN KEY (user) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (reported) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = UserReport;
//# sourceMappingURL=UserReport.js.map