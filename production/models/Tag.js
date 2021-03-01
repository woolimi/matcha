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
class Tag extends Model_1.default {
    static init() {
        return Model_1.default.init('tags', Tag);
    }
    static search(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Tag.query(`SELECT * FROM ${this.tname} WHERE name = ?`, [name]);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static add(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Tag.query('INSERT IGNORE INTO tags (`name`) VALUES (?)', [name]);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static get_tags() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield Tag.query('SELECT name FROM tags');
                return rows.map((tag) => tag.name);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static get_tag_ids() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield Tag.query('SELECT id FROM tags');
                return rows.map((tag) => tag.id);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
Tag.tname = 'tags';
Tag.table = `CREATE TABLE tags (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			UNIQUE KEY name_UNIQUE (name)
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
exports.default = Tag;
//# sourceMappingURL=Tag.js.map