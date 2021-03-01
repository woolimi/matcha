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
const express_1 = __importDefault(require("express"));
const authToken_1 = __importDefault(require("../../middleware/authToken"));
const User_1 = __importDefault(require("../../models/User"));
const Location_1 = require("../../services/Location");
const validator_1 = __importDefault(require("../../middleware/validator"));
const searchRouter = express_1.default.Router();
searchRouter.get('/', authToken_1.default, validator_1.default.searchQuery, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const users = yield User_1.default.search(req.user.id, query);
        return res.json({ users: users.map((u) => (Object.assign(Object.assign({}, u), { location: Location_1.xy2ll(u.location) }))) });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
}));
exports.default = searchRouter;
//# sourceMappingURL=search.js.map