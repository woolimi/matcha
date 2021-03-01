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
exports.send_reset_password_email = exports.send_verification_email = void 0;
const mailgun_js_1 = __importDefault(require("mailgun-js"));
const dotenv_1 = __importDefault(require("dotenv"));
const Token_1 = require("./Token");
dotenv_1.default.config();
const DOMAIN = "sandboxd05e92bd5d9e40f99e93d11755f649a2.mailgun.org";
const API_KEY = process.env.MAILGUN_API;
const mg = mailgun_js_1.default({ apiKey: API_KEY, domain: DOMAIN });
function send_email(to, template, content) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("URL", content.email_verification_url);
        const data = {
            from: "no-reply <postmaster@sandboxd05e92bd5d9e40f99e93d11755f649a2.mailgun.org>",
            to,
            subject: content.subject,
            template,
            "h:X-Mailgun-Variables": JSON.stringify(content),
        };
        try {
            return yield mg.messages().send(data);
        }
        catch (error) {
            throw error;
        }
    });
}
function send_verification_email(to, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = Token_1.generateToken({ id: userId }, "access");
            const content = {};
            content.subject = "Email verification";
            content.email_verification_url = `${process.env.API || "http://localhost:5000"}/auth/email-verification/${token}`;
            const mail = yield send_email(to, "verification", content);
            console.log("Email : ", mail);
            console.log("Email verification token : ", token);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.send_verification_email = send_verification_email;
function send_reset_password_email(to, new_password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = {};
            content.new_password = new_password;
            content.subject = "Reset Password";
            const mail = yield send_email(to, "reset_password", content);
            console.log("Email : ", mail);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.send_reset_password_email = send_reset_password_email;
//# sourceMappingURL=Mailing.js.map