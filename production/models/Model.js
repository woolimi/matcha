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
class Model {
    static query(sql, placeholder) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sql.match(/(^update)|(^delete)|(^insert)/i)) {
                const result = yield MySQL_1.default.pool.query(sql, placeholder);
                return result[0];
            }
            const [rows, fields] = yield MySQL_1.default.pool.query(sql, placeholder);
            return rows;
        });
    }
    static init(modelName, modelClass) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hasTable = yield this.query(`SHOW TABLES FROM matcha LIKE '${modelName}'`);
                if (hasTable.length > 0)
                    return console.log(`⚡️[server]: Table '${modelName}' already exist`);
                yield Model.query(modelClass.table);
                console.log(`⚡️[server]: Table '${modelName}' created`);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    static find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rows = yield Model.query(`SELECT * FROM ${this.tname} WHERE id = ? LIMIT 1`, [id]);
                if (rows.length < 1)
                    throw 'User not found';
                return rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
}
Model.tname = 'null';
exports.default = Model;
//# sourceMappingURL=Model.js.map