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
const requireNotSelf_1 = __importDefault(require("../../middleware/requireNotSelf"));
const Chat_1 = __importDefault(require("../../models/Chat"));
const User_1 = __importDefault(require("../../models/User"));
const UserLike_1 = __importDefault(require("../../models/UserLike"));
const UserNotification_1 = __importDefault(require("../../models/UserNotification"));
const UserReport_1 = __importDefault(require("../../models/UserReport"));
const reportRouter = express_1.default.Router();
reportRouter.post('/:id', authToken_1.default, requireNotSelf_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = parseInt(req.params.id);
    const self = parseInt(req.user.id);
    if (isNaN(id) || id < 1 || !(yield User_1.default.exists(id))) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    const userReport = yield UserReport_1.default.get(self, id);
    if (userReport) {
        const result = yield UserReport_1.default.remove(userReport.id);
        if (!result) {
            return res.status(500).send({ error: 'Could not remove report.' });
        }
        const otherSocket = req.app.sockets[id];
        if (otherSocket) {
            const otherUserPage = req.app.currentPage[otherSocket.id];
            if (otherUserPage && otherUserPage.name == 'app-users-id' && ((_a = otherUserPage === null || otherUserPage === void 0 ? void 0 : otherUserPage.params) === null || _a === void 0 ? void 0 : _a.id) == self) {
                console.log('💨[socket]: send unblockedBy to ', otherSocket.id);
                otherSocket.emit('unblockedBy', { user: self });
            }
        }
        return res.json({ id: userReport.id, status: false });
    }
    else {
        const likeStatus = yield UserLike_1.default.status(self, id);
        if (likeStatus != 0) {
            yield UserLike_1.default.removeAll(self, id);
            if (likeStatus == 2) {
                yield User_1.default.updateFame(self, -10);
                yield User_1.default.updateFame(id, -10);
            }
            else if (likeStatus == 1) {
                yield User_1.default.updateFame(id, -4);
            }
            else if (likeStatus == 3) {
                yield User_1.default.updateFame(self, -4);
            }
        }
        const result = yield UserReport_1.default.add(self, id);
        if (!result) {
            return res.status(500).send({ error: 'Could not create report.' });
        }
        const chat = yield Chat_1.default.getForUser(self, id);
        if (chat)
            yield Chat_1.default.delete(chat.id);
        yield UserNotification_1.default.removeAllForUser(self, id);
        yield UserNotification_1.default.removeAllForUser(id, self);
        const otherSocket = req.app.sockets[id];
        if (otherSocket) {
            const otherUserPage = req.app.currentPage[otherSocket.id];
            if ((otherUserPage && otherUserPage.name == 'app-users-id' && ((_b = otherUserPage.params) === null || _b === void 0 ? void 0 : _b.id) == self) ||
                likeStatus != 0) {
                console.log('💨[socket]: send blockedBy to ', otherSocket.id);
                otherSocket.emit('blockedBy', { user: self });
            }
        }
        return res.send({ id: result.insertId, at: new Date(), status: true });
    }
}));
exports.default = reportRouter;
//# sourceMappingURL=report.js.map