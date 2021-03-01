"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const database_json_1 = __importDefault(require("../config/database.json"));
const database_prod_json_1 = __importDefault(require("../config/database-prod.json"));
let pool = process.env.ENVIRONMENT === "prod"
    ? promise_1.default.createPool(database_prod_json_1.default.MYSQL_CONFIG)
    : promise_1.default.createPool(database_json_1.default.MYSQL_CONFIG);
exports.default = {
    pool,
    CHARSET: "utf8mb4",
    COLLATION: "utf8mb4_unicode_ci",
};
//# sourceMappingURL=MySQL.js.map