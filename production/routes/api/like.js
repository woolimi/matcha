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
const likeRouter = express_1.default.Router();
likeRouter.post('/:id', authToken_1.default, requireNotSelf_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const self = parseInt(req.user.id);
    if (isNaN(id) || id < 1 || !(yield User_1.default.exists(req.params.id))) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    const status = yield UserLike_1.default.status(self, id);
    if (status == 0 || status == 3) {
        yield UserLike_1.default.add(self, id);
        const fameIncrease = status == 0 ? 4 : 10;
        yield User_1.default.updateFame(id, fameIncrease);
        if (status == 3) {
            yield User_1.default.updateFame(self, 6);
        }
        const notificationType = status == 0 ? "like:received" : "like:match";
        const notifInsert = yield UserNotification_1.default.add(id, self, notificationType);
        if (!notifInsert) {
            return res.status(500).send({ error: 'Could not insert a new notification.' });
        }
        const chat = yield Chat_1.default.getForUser(self, id);
        const otherSocket = req.app.sockets[id];
        if (otherSocket) {
            if (chat && status == 3) {
                const user = (yield User_1.default.getSimple(self));
                user.online = req.app.sockets[self] != undefined;
                console.log('💨[socket]: send chat/addToList to ', otherSocket.id);
                otherSocket.emit('chat/addToList', Object.assign(Object.assign({}, chat), { user }));
            }
            const user = yield User_1.default.getSimple(self);
            console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
            otherSocket.emit('notifications/receive', {
                id: notifInsert.insertId,
                type: notificationType,
                at: new Date(),
                sender: self,
                status: 0,
                user,
            });
        }
        const socket = req.app.sockets[self];
        if (socket && chat) {
            const user = (yield User_1.default.getSimple(id));
            user.online = req.app.sockets[id] != undefined;
            console.log('💨[socket]: send chat/addToList to ', socket.id);
            socket.emit('chat/addToList', Object.assign(Object.assign({}, chat), { user }));
        }
        return res.send({ like: status == 0 ? 1 : 2 });
    }
    else {
        yield UserLike_1.default.remove(self, id);
        if (status == 2) {
            yield User_1.default.updateFame(id, -10);
            yield User_1.default.updateFame(self, -6);
        }
        else
            yield User_1.default.updateFame(id, -4);
        const notifInsert = yield UserNotification_1.default.add(id, self, "like:removed");
        if (!notifInsert) {
            return res.status(500).send({ error: 'Could not insert a new notification.' });
        }
        const otherSocket = req.app.sockets[id];
        if (otherSocket) {
            const user = yield User_1.default.getSimple(self);
            console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
            otherSocket.emit('notifications/receive', {
                id: notifInsert.insertId,
                type: "like:removed",
                at: new Date(),
                sender: self,
                status: 0,
                user,
            });
        }
        return res.send({ like: status == 2 ? 3 : 0 });
    }
}));
exports.default = likeRouter;
//# sourceMappingURL=like.js.map