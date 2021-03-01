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
const Database_1 = __importDefault(require("./Database"));
const MySQL_1 = __importDefault(require("./MySQL"));
const database_json_1 = __importDefault(require("../config/database.json"));
function init_db() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield MySQL_1.default.pool.query(`DROP DATABASE \`${database_json_1.default.MYSQL_CONFIG.database}\``);
            yield MySQL_1.default.pool.query(`CREATE DATABASE \`${database_json_1.default.MYSQL_CONFIG.database}\``);
            yield MySQL_1.default.pool.query(`USE \`${database_json_1.default.MYSQL_CONFIG.database}\``);
            yield Database_1.default.init();
            process.exit();
        }
        catch (error) {
            console.error(error);
            process.exit();
        }
    });
}
init_db();
//# sourceMappingURL=InitDB.js.map