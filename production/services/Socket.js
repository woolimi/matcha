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
exports.bindSocket = void 0;
const chat_1 = require("../routes/api/chat");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Chat_1 = __importDefault(require("../models/Chat"));
const User_1 = __importDefault(require("../models/User"));
function sendStatusChange(status, app, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const chats = yield Chat_1.default.getAll(user);
        for (const chat of chats) {
            const otherUser = chat.user1 == user ? chat.user2 : chat.user1;
            if (app.sockets[otherUser]) {
                app.sockets[otherUser].emit(status == 0 ? 'userLogout' : 'userLogin', { user });
            }
        }
    });
}
function bindSocket(app, io) {
    io.on('connection', (socket) => {
        console.log('💨[socket]: connected', socket.id);
        socket.on('socket/login', (payload, callback) => {
            var _a;
            if (!payload || !payload.token) {
                return callback({ error: true });
            }
            const token = (_a = payload.token.split(' ')[1]) !== null && _a !== void 0 ? _a : '';
            jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => __awaiter(this, void 0, void 0, function* () {
                var _b, _c;
                if (err) {
                    callback({ error: true });
                }
                else {
                    console.log('💨[socket]: linked user', user.id, 'to socket', socket.id);
                    app.users[socket.id] = user.id;
                    app.sockets[user.id] = socket;
                    callback({ success: true });
                    yield User_1.default.updateLastLogin(user.id);
                    sendStatusChange(1, app, user.id);
                    for (const socketId of Object.keys(app.currentPage)) {
                        if (app.currentPage[socketId].name == 'app-users-id' &&
                            parseInt((_c = (_b = app.currentPage[socketId].params) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : '') == user.id) {
                            const otherUser = app.users[socketId];
                            if (!otherUser)
                                continue;
                            const otherSocket = app.sockets[otherUser];
                            if (!otherSocket)
                                continue;
                            otherSocket.emit('userLogin', { user: user.id });
                        }
                    }
                }
            }));
        });
        socket.on('chat/sendMessage', (payload) => {
            console.log('💨[socket]: receive chat/sendMessage from', socket.id);
            chat_1.sendMessage(app, socket, payload);
        });
        socket.on('user/changePage', (payload) => {
            console.log('💨[socket]: receive user/changePage from', socket.id);
            app.currentPage[socket.id] = payload;
        });
        socket.on('disconnect', () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log('💨[socket]: disconnected', socket.id);
            const userId = app.users[socket.id];
            if (userId) {
                yield User_1.default.updateLastLogin(userId);
                sendStatusChange(0, app, userId);
                for (const socketId of Object.keys(app.currentPage)) {
                    if (app.currentPage[socketId].name == 'app-users-id' &&
                        parseInt((_b = (_a = app.currentPage[socketId].params) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '') == userId) {
                        const otherUser = app.users[socketId];
                        if (!otherUser)
                            continue;
                        const otherSocket = app.sockets[otherUser];
                        if (!otherSocket)
                            continue;
                        otherSocket.emit('userLogout', { user: userId });
                    }
                }
                delete app.sockets[userId];
            }
            delete app.users[socket.id];
            delete app.currentPage[socket.id];
        }));
    });
}
exports.bindSocket = bindSocket;
//# sourceMappingURL=Socket.js.map