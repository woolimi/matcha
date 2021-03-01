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
exports.sendMessage = void 0;
const express_1 = __importDefault(require("express"));
const authToken_1 = __importDefault(require("../../middleware/authToken"));
const requireNotSelf_1 = __importDefault(require("../../middleware/requireNotSelf"));
const Chat_1 = __importDefault(require("../../models/Chat"));
const ChatMessage_1 = __importDefault(require("../../models/ChatMessage"));
const User_1 = __importDefault(require("../../models/User"));
const UserLike_1 = __importDefault(require("../../models/UserLike"));
const UserNotification_1 = __importDefault(require("../../models/UserNotification"));
const chatRouter = express_1.default.Router();
chatRouter.get('/list', authToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user.id;
    const chats = yield Chat_1.default.getAll(user);
    const userIds = chats.map((chat) => {
        if (chat.user1 == user)
            return chat.user2;
        return chat.user1;
    });
    const simpleUsers = yield User_1.default.getAllSimple(userIds);
    const users = {};
    for (const user of simpleUsers) {
        const online = req.app.sockets[user.id] != undefined ? true : (_a = user.login) !== null && _a !== void 0 ? _a : false;
        users[user.id] = Object.assign(Object.assign({}, user), { online });
    }
    const result = [];
    for (const chat of chats) {
        const otherUser = user == chat.user1 ? chat.user2 : chat.user1;
        result.push({
            id: chat.id,
            start: chat.start,
            last: chat.last,
            user: users[otherUser],
        });
    }
    res.send(result);
}));
chatRouter.post('/create/:id', authToken_1.default, requireNotSelf_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const id = req.params.id;
    const self = req.user.id;
    if (isNaN(id) || id < 1) {
        return res.status(404).send({ error: 'User not found' });
    }
    const otherUser = yield User_1.default.getSimple(id);
    if (!otherUser) {
        return res.status(404).send({ error: 'User not found' });
    }
    const like = yield UserLike_1.default.status(self, id);
    if (like != 2) {
        return res.status(400).send({ error: 'Both Users need to like each other to create a Chat' });
    }
    let chat = yield Chat_1.default.getForUser(id, self);
    let created = false;
    if (!chat) {
        const insert = yield Chat_1.default.create(self, id);
        if (!insert) {
            return res.status(500).send({ error: 'Could not create a Chat.' });
        }
        chat = { id: insert.insertId, user1: self, user2: id, start: new Date().toISOString(), last: null };
        created = true;
    }
    const socket = req.app.sockets[self];
    if (socket) {
        otherUser.online = req.app.sockets[id] != undefined ? true : (_b = otherUser.login) !== null && _b !== void 0 ? _b : false;
        console.log('💨[socket]: send chat/addToList to ', socket.id);
        socket.emit('chat/addToList', Object.assign(Object.assign({}, chat), { user: otherUser }));
    }
    const otherSocket = req.app.sockets[id];
    if (otherSocket) {
        const user = (yield User_1.default.getSimple(self));
        user.online = req.app.sockets[self] != undefined ? true : (_c = user.login) !== null && _c !== void 0 ? _c : false;
        console.log('💨[socket]: send chat/addToList to ', otherSocket.id);
        otherSocket.emit('chat/addToList', Object.assign(Object.assign({}, chat), { user }));
    }
    return res.status(created ? 201 : 200).json({ chat: chat.id });
}));
chatRouter.get('/user/:id', authToken_1.default, requireNotSelf_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.user.id);
    if (isNaN(id) || id < 1) {
        return res.status(404).send({ error: 'User not found' });
    }
    const chat = yield Chat_1.default.getForUser(id, req.params.id);
    if (!chat) {
        return res.status(404).send({ error: 'No Chat found with this user' });
    }
    return res.json(chat);
}));
chatRouter.get('/:id/:from?', authToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const self = parseInt(req.user.id);
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(404).send({ error: 'Chat not found' });
    }
    const chat = yield Chat_1.default.get(id);
    if (!chat)
        return res.status(404).json({ error: 'Chat not found' });
    if (chat.user1 != self && chat.user2 != self)
        return res.status(401).json({ error: 'Unauthorized Chat' });
    const userId = chat.user1 == self ? chat.user2 : chat.user1;
    const like = yield UserLike_1.default.status(self, userId);
    if (like != 2) {
        return res.status(401).send({ error: 'Both Users need to like each other to Chat' });
    }
    let from = req.params.from ? parseInt(req.params.from) : undefined;
    if (!from || isNaN(from))
        from = 0;
    const messages = yield ChatMessage_1.default.getAllPage(chat.id, from);
    const completed = messages.length < 20;
    if (!from) {
        const notification = yield UserNotification_1.default.getLastMessage(self, userId);
        if (notification && !notification.status) {
            yield UserNotification_1.default.setAsRead(notification.id);
        }
        return res.json({ chat, notification: notification === null || notification === void 0 ? void 0 : notification.id, messages, completed });
    }
    return res.json({ messages, completed });
}));
function sendMessage(app, socket, payload) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof payload.chat !== 'number' || typeof payload.message !== 'string') {
            return socket.emit('chat/messageError', { error: 'Invalid payload' });
        }
        if (!payload.message)
            return socket.emit('chat/messageError', { error: 'Empty message' });
        const self = app.users[socket.id];
        if (!self) {
            socket.emit('socket/loggedOut');
            return socket.emit('chat/messageError', { error: 'Invalid user, refresh the page' });
        }
        const chat = yield Chat_1.default.get(payload.chat);
        if (!chat)
            return socket.emit('chat/messageError', { error: 'Invalid chat' });
        if (chat.user1 != self && chat.user2 != self) {
            return socket.emit('chat/messageError', { error: 'Unauthorized chat' });
        }
        const otherUser = chat.user1 == self ? chat.user2 : chat.user1;
        const like = yield UserLike_1.default.status(self, otherUser);
        if (like != 2) {
            return socket.emit('chat/messageError', { error: 'Both Users need to like each other to Chat' });
        }
        const queryResult = yield ChatMessage_1.default.add(chat.id, self, payload.message);
        if (queryResult === false) {
            return socket.emit('chat/messageError', { error: 'Could not save message' });
        }
        const chatMessage = yield ChatMessage_1.default.get(queryResult.insertId);
        yield Chat_1.default.updateLastMessage(chat.id);
        const otherSocket = app.sockets[otherUser];
        if (otherSocket) {
            console.log('💨[socket]: send chat/receiveMessage to ', otherSocket.id);
            otherSocket.emit('chat/receiveMessage', {
                id: queryResult.insertId,
                chat: chat.id,
                sender: self,
                at: new Date(),
                content: payload.message,
            });
        }
        let addNotification = !otherSocket ||
            ((_a = app.currentPage[otherSocket.id]) === null || _a === void 0 ? void 0 : _a.name) != 'app-chat-id' ||
            parseInt((_d = (_c = (_b = app.currentPage[otherSocket.id]) === null || _b === void 0 ? void 0 : _b.params) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : '0') != chat.id;
        if (addNotification) {
            const lastMessage = yield UserNotification_1.default.getLastMessage(otherUser, self);
            if (!lastMessage || lastMessage.status) {
                const lastNotification = yield UserNotification_1.default.getLast(self);
                if (!lastNotification ||
                    lastNotification.type != "message:received" ||
                    lastNotification.sender != self ||
                    lastNotification.status) {
                    const notifResult = yield UserNotification_1.default.add(otherUser, self, "message:received");
                    if (notifResult) {
                        const currentUser = yield User_1.default.getSimple(self);
                        if (otherSocket) {
                            console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
                            otherSocket.emit('notifications/receive', {
                                id: notifResult.insertId,
                                type: "message:received",
                                at: new Date(),
                                sender: self,
                                status: 0,
                                user: currentUser,
                            });
                        }
                    }
                }
            }
        }
        console.log('💨[socket]: send chat/receiveMessage to ', socket.id);
        socket.emit('chat/receiveMessage', chatMessage);
    });
}
exports.sendMessage = sendMessage;
exports.default = chatRouter;
//# sourceMappingURL=chat.js.map