"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
        return res.status(401).json({ error: 'Invalid token type' });
    }
    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token expired' });
        }
        req.user = user;
        next();
    });
};
exports.default = authToken;
//# sourceMappingURL=authToken.js.map