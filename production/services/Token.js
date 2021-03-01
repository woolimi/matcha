"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.deleteRefreshToken = exports.setRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function setRefreshToken(res, user) {
    const rtoken = generateToken(user, 'refresh');
    res.cookie(process.env.REFRESH_COOKIE_NAME, rtoken, {
        expires: new Date(Date.now() + 1000 * parseInt(process.env.REFRESH_TOKEN_EXP)),
        secure: process.env.ENVIRONMENT === 'prod' ? true : false,
        httpOnly: true,
        sameSite: true,
        path: '/',
    });
    return rtoken;
}
exports.setRefreshToken = setRefreshToken;
function deleteRefreshToken(res) {
    return res.cookie(process.env.REFRESH_COOKIE_NAME, 'false', {
        expires: new Date(Date.now()),
        secure: false,
        httpOnly: false,
        sameSite: false,
        path: '/',
    });
}
exports.deleteRefreshToken = deleteRefreshToken;
function generateToken(obj, option = 'access') {
    if (option == 'access') {
        const access = jsonwebtoken_1.default.sign(obj, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: `${process.env.ACCESS_TOKEN_EXP}s`,
        });
        console.log('⚡️[server]: access token generated');
        return access;
    }
    if (option == 'refresh') {
        const refresh = jsonwebtoken_1.default.sign(obj, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: `${process.env.REFRESH_TOKEN_EXP}s`,
        });
        console.log('⚡️[server]: refresh token generated');
        return refresh;
    }
}
exports.generateToken = generateToken;
//# sourceMappingURL=Token.js.map