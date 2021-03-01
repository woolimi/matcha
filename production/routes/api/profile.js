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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_type_1 = __importDefault(require("file-type"));
const express_1 = __importDefault(require("express"));
const authToken_1 = __importDefault(require("../../middleware/authToken"));
const multer_1 = require("../../middleware/multer");
const User_1 = __importDefault(require("../../models/User"));
const Mailing_1 = require("../../services/Mailing");
const validator_1 = __importDefault(require("../../middleware/validator"));
const UserPicture_1 = __importDefault(require("../../models/UserPicture"));
const UserNotification_1 = __importDefault(require("../../models/UserNotification"));
const UserTag_1 = __importDefault(require("../../models/UserTag"));
const UserLanguage_1 = __importDefault(require("../../models/UserLanguage"));
const UserBlock_1 = __importDefault(require("../../models/UserBlock"));
const UserLike_1 = __importDefault(require("../../models/UserLike"));
const UserReport_1 = __importDefault(require("../../models/UserReport"));
const Model_1 = __importDefault(require("../../models/Model"));
const profileRouter = express_1.default.Router();
profileRouter.put('/images/:user_id/:image_id', authToken_1.default, validator_1.default.userPictures, multer_1.upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileType = yield file_type_1.default.fromFile(req.file.path);
        if (!fileType || fileType.mime !== req.file.mimetype) {
            fs_1.default.unlink(path_1.default.resolve(__dirname, '../../', req.file.path), (err) => {
                if (err)
                    console.log(err);
            });
            return res.json({ error: 'Invalid image' });
        }
        yield UserPicture_1.default.create_or_update(req.params.user_id, req.params.image_id, req.file.path);
        const images = yield UserPicture_1.default.get_images(req.params.user_id);
        res.json({ images });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
profileRouter.post('/images/:user_id/:image_id', authToken_1.default, validator_1.default.userPictures, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield UserPicture_1.default.delete_image(req.params.user_id, req.params.image_id, req.body.path);
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}));
profileRouter.post('/send-email-verification', authToken_1.default, validator_1.default.userEmailVerification, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        yield Model_1.default.query('START TRANSACTION');
        yield User_1.default.query('UPDATE users SET email = ?, verified = false WHERE id = ?', [data.email, req.user.id]);
        yield Mailing_1.send_verification_email(data.email, req.user.id);
        yield Model_1.default.query('COMMIT');
        res.json({
            message: 'Email has been sent successfully.',
            email: data.email,
            verified: false,
        });
    }
    catch (error) {
        console.error(error);
        yield Model_1.default.query('ROLLBACK');
        res.sendStatus(400);
    }
}));
profileRouter.post('/location', authToken_1.default, validator_1.default.userLocation, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = req.body;
        yield User_1.default.updateLocation(location);
        res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
profileRouter.post('/public-info', authToken_1.default, validator_1.default.userPublic, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield User_1.default.updatePublic(req.user.id, req.body);
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}));
profileRouter.post('/change-password', authToken_1.default, validator_1.default.userChangePassword, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield User_1.default.changePassword(req.body);
        res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}));
profileRouter.get('/:id', authToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const self = parseInt(req.user.id);
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(404).json({ error: 'Profile not found.' });
    }
    const isBlocked = yield UserBlock_1.default.status(id, self);
    const isReported = yield UserReport_1.default.get(id, self);
    if (isBlocked || isReported)
        return res.status(401).json({ error: "You can't view this Profile right now." });
    const profile = yield User_1.default.getPublicProfile(id);
    if (!profile)
        return res.status(404).json({ error: 'This Profile does not exists.' });
    const like = yield UserLike_1.default.status(self, id);
    const blocked = yield UserBlock_1.default.status(self, id);
    const reported = yield UserReport_1.default.get(self, id);
    const images = (yield UserPicture_1.default.get_images(id)).filter((i) => i.path != '');
    const tags = yield UserTag_1.default.get_tags(id);
    const languages = yield UserLanguage_1.default.get_languages(id);
    const history = yield UserNotification_1.default.getHistory(self, id);
    const userIds = Array.from(new Set(history.map((n) => n.sender)));
    const otherUsers = yield User_1.default.getAllSimple(userIds);
    if (id != self) {
        yield User_1.default.updateFame(id, 1);
        profile.fame += 1;
        const notifInsert = yield UserNotification_1.default.add(id, self, "profile:visited");
        if (notifInsert) {
            const otherSocket = req.app.sockets[id];
            if (otherSocket) {
                const currentUser = yield User_1.default.getSimple(self);
                console.log('💨[socket]: send notifications/receive to ', otherSocket.id);
                otherSocket.emit('notifications/receive', {
                    id: notifInsert.insertId,
                    type: "profile:visited",
                    at: new Date(),
                    sender: self,
                    status: 0,
                    user: currentUser,
                });
            }
        }
        const types = ["profile:visited", "like:received", "like:match"];
        const notifications = (yield UserNotification_1.default.getAnyOf(self, id, types)).map((n) => n.id);
        if (notifications.length > 0) {
            yield UserNotification_1.default.setListAsRead(notifications);
            const socket = req.app.sockets[self];
            if (socket) {
                console.log('💨[socket]: send notifications/setListAsRead to ', socket.id);
                socket.emit('notifications/setListAsRead', { list: notifications });
            }
        }
    }
    return res.json(Object.assign(Object.assign({}, profile), { online: req.app.sockets[id] != undefined ? true : (_a = profile.login) !== null && _a !== void 0 ? _a : false, like,
        blocked, reported: reported != null, images,
        tags,
        languages, history: history
            .map((n) => {
            const otherUser = otherUsers.find((user) => user.id == n.sender);
            if (otherUser)
                return Object.assign(Object.assign({}, n), { user: otherUser });
            return undefined;
        })
            .filter((n) => n !== undefined) }));
}));
exports.default = profileRouter;
//# sourceMappingURL=profile.js.map