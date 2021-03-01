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
const UserNotification_1 = __importDefault(require("../../models/UserNotification"));
const notificationRouter = express_1.default.Router();
notificationRouter.get('/list', authToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const self = parseInt(req.user.id);
    const notifications = yield UserNotification_1.default.getAll(self);
    const userIds = Array.from(new Set(notifications.map((notification) => notification.sender)));
    const otherUsers = yield User_1.default.getAllSimple(userIds);
    res.send(notifications
        .map((notification) => {
        const otherUser = otherUsers.find((user) => user.id == notification.sender);
        if (otherUser)
            return Object.assign(Object.assign({}, notification), { user: otherUser });
        return undefined;
    })
        .filter((n) => n !== undefined));
}));
notificationRouter.post('/read', authToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.body.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).send({ error: 'Missing or invalid notification ID' });
    }
    const notification = yield UserNotification_1.default.get(id);
    if (!notification) {
        return res.status(400).send({ error: 'Notification does not exists' });
    }
    const result = yield UserNotification_1.default.setAsRead(id);
    if (!result) {
        return res.status(500).send({ error: 'Could not update the notification' });
    }
    return res.send({ success: true });
}));
notificationRouter.post('/read/all', authToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield UserNotification_1.default.setAllAsRead(req.user.id);
    if (!result)
        return res.status(500).send({ error: 'Could not update the notifications' });
    return res.send({ success: true });
}));
exports.default = notificationRouter;
//# sourceMappingURL=notifications.js.map