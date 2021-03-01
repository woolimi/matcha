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
const User_1 = __importDefault(require("../../models/User"));
const checkRouter = express_1.default.Router();
checkRouter.post('/email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const check = yield User_1.default.query('SELECT id FROM users WHERE email = ?', [email]);
        if (!check || check.length == 0)
            res.sendStatus(200);
        else
            res.send({ error: 'emails is already taken' });
    }
    catch (error) {
        res.status(400);
    }
}));
checkRouter.post('/username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        const check = yield User_1.default.query('SELECT id FROM users WHERE username = ?', [username]);
        if (!check || check.length == 0)
            res.sendStatus(200);
        else
            res.send({ error: 'username is already taken' });
    }
    catch (error) {
        res.status(400);
    }
}));
exports.default = checkRouter;
//# sourceMappingURL=check.js.map