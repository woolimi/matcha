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
const Chat_1 = __importDefault(require("./Chat"));
const User_1 = __importDefault(require("./User"));
class ChatMessage extends Model_1.default {
    static init() {
        return Model_1.default.init('chat_messages', ChatMessage);
    }
    static add(chat, sender, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield ChatMessage.query(`INSERT INTO ${ChatMessage.tname} (chat, sender, content) VALUES (?, ?, ?)`, [chat, sender, content]));
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    static get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield ChatMessage.query(`SELECT * FROM ${ChatMessage.tname} WHERE id = ?`, [id]);
            if (result && result.length == 1) {
                return result[0];
            }
            return null;
        });
    }
    static getAllPage(id, fromId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fromId) {
                return ChatMessage.query(`SELECT * FROM ${ChatMessage.tname} WHERE chat = ? AND id < ? ORDER BY id DESC LIMIT 20`, [id, fromId]);
            }
            return ChatMessage.query(`SELECT * FROM ${ChatMessage.tname} WHERE chat = ? ORDER BY id DESC LIMIT 20`, [id]);
        });
    }
}
ChatMessage.tname = 'chat_messages';
ChatMessage.table = `CREATE TABLE chat_messages (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			chat INT UNSIGNED NOT NULL,
			sender INT UNSIGNED NOT NULL,
			at DATETIME DEFAULT NOW(),
			content TEXT NOT NULL,
			FOREIGN KEY (chat) REFERENCES ${Chat_1.default.tname} (id) ON DELETE CASCADE,
			FOREIGN KEY (sender) REFERENCES ${User_1.default.tname} (id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = ChatMessage;
//# sourceMappingURL=ChatMessage.js.map