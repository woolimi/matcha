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
const Chat_1 = __importDefault(require("../models/Chat"));
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const Tag_1 = __importDefault(require("../models/Tag"));
const User_1 = __importDefault(require("../models/User"));
const UserBlock_1 = __importDefault(require("../models/UserBlock"));
const UserLike_1 = __importDefault(require("../models/UserLike"));
const UserNotification_1 = __importDefault(require("../models/UserNotification"));
const UserPicture_1 = __importDefault(require("../models/UserPicture"));
const UserTag_1 = __importDefault(require("../models/UserTag"));
const UserLanguage_1 = __importDefault(require("../models/UserLanguage"));
const UserReport_1 = __importDefault(require("../models/UserReport"));
class Database {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('⚡️[server]: Connected to MYSQL Server');
            yield Tag_1.default.init();
            yield User_1.default.init();
            yield UserTag_1.default.init();
            yield UserPicture_1.default.init();
            yield UserLike_1.default.init();
            yield UserBlock_1.default.init();
            yield UserNotification_1.default.init();
            yield Chat_1.default.init();
            yield ChatMessage_1.default.init();
            yield UserLanguage_1.default.init();
            yield UserReport_1.default.init();
        });
    }
}
exports.default = Database;
//# sourceMappingURL=Database.js.map