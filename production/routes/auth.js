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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authToken_1 = __importDefault(require("../middleware/authToken"));
const User_1 = __importDefault(require("../models/User"));
const lodash_1 = __importDefault(require("lodash"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("../middleware/validator"));
const path_1 = __importDefault(require("path"));
const Mailing_1 = require("../services/Mailing");
const Token_1 = require("../services/Token");
const getLocation_1 = __importDefault(require("../middleware/getLocation"));
const Model_1 = __importDefault(require("../models/Model"));
const randomstring_1 = __importDefault(require("randomstring"));
const authRouter = express_1.default.Router();
authRouter.post("/login", validator_1.default.userLogin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loginForm = req.body;
        const queryResult = yield User_1.default.query("SELECT * FROM users WHERE username = ? LIMIT 1", [loginForm.username]);
        if (!queryResult.length) {
            console.log(`username(${loginForm.username}) not matched`);
            return res.status(200).send({ error: "Wrong username or password" });
        }
        const user = queryResult[0];
        const isValidPassword = yield bcrypt_1.default.compare(loginForm.password, user.password);
        if (!isValidPassword) {
            console.log(`${loginForm.username}'s password not matched`);
            return res.status(200).send({ error: "Wrong username or password" });
        }
        const u = lodash_1.default.pick(user, ["id"]);
        const refresh_token = Token_1.setRefreshToken(res, u);
        return res.json({
            access_token: Token_1.generateToken(u, "access"),
            refresh_token,
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
}));
authRouter.post("/refresh", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let refresh_token = req.cookies["auth._refresh_token.cookie"];
    if (!refresh_token)
        return res.json({
            error: "refresh_token not exist",
        });
    try {
        const user = yield jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        delete user.exp;
        delete user.iat;
        refresh_token = Token_1.setRefreshToken(res, user);
        return res.json({
            access_token: Token_1.generateToken(user, "access"),
            refresh_token,
        });
    }
    catch (error) {
        console.log("REFRESH TOKEN ERROR: ", error);
        res.json({
            error: "invlid refresh_token",
        });
    }
}));
authRouter.delete("/logout", (req, res) => {
    const refresh_token = req.cookies[process.env.REFRESH_COOKIE_NAME];
    if (!refresh_token)
        return res.sendStatus(200);
    Token_1.deleteRefreshToken(res);
    return res.sendStatus(200);
});
authRouter.post("/register", validator_1.default.userRegister, getLocation_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formData = req.body;
        yield Model_1.default.query("START TRANSACTION");
        const result = yield User_1.default.register(formData);
        yield Mailing_1.send_verification_email(formData.email, result.insertId);
        yield Model_1.default.query("COMMIT");
        return res.sendStatus(201);
    }
    catch (error) {
        console.error(error);
        yield Model_1.default.query("ROLLBACK");
        return res.sendStatus(403);
    }
}));
authRouter.post("/reset-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const result = yield User_1.default.query("SELECT * FROM users WHERE username = ? LIMIT 1", [data.username]);
        if (!result.length)
            throw { error: "Invalid username" };
        const email = result[0].email;
        const new_password = randomstring_1.default.generate(10);
        const hashed_new_password = yield bcrypt_1.default.hash(new_password, 10);
        yield Model_1.default.query("START TRANSACTION");
        yield User_1.default.query("UPDATE users SET password = ? WHERE id = ? LIMIT 1", [
            hashed_new_password,
            result[0].id,
        ]);
        yield Mailing_1.send_reset_password_email(email, new_password);
        yield Model_1.default.query("COMMIT");
        return res.status(200).json({
            message: "Successfully sent email with new password. Please check your email",
        });
    }
    catch (e) {
        console.log(e);
        yield Model_1.default.query("ROLLBACK");
        if (e.error) {
            res.json({ error: e });
        }
        else
            res.sendStatus(400);
    }
}));
authRouter.post("/social", getLocation_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uinfo = req.body;
        let user_id;
        if (uinfo.provider === "google") {
            user_id = yield User_1.default.register_google(uinfo);
        }
        else
            throw "No provider info";
        const user = yield User_1.default.me(user_id);
        return res.status(200).json({
            user,
            access_token: Token_1.generateToken({ id: user.id }, "access"),
            refresh_token: Token_1.setRefreshToken(res, { id: user.id }),
        });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
}));
authRouter.get("/email-verification/:jwt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield jsonwebtoken_1.default.verify(req.params.jwt, process.env.ACCESS_TOKEN_SECRET);
        const result = yield User_1.default.query("UPDATE users SET verified = ? WHERE id = ?", [true, user.id]);
        if (!result.affectedRows)
            throw Error(`User id ${user.id} doesn't exist.`);
        res.redirect("/auth/email-verification?result=success");
    }
    catch (error) {
        console.log("EMAIL VERIFICATION ERROR : ", error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.redirect("/auth/email-verification?result=fail&reason=" +
                encodeURIComponent("Your token is expired"));
        }
        else {
            res.redirect("/auth/email-verification?result=fail&reason=" +
                encodeURIComponent("Invalid token"));
        }
    }
}));
authRouter.get("/email-verification", (req, res) => {
    if (req.query.result === "success") {
        res
            .status(200)
            .render(path_1.default.join(__dirname, "../views", "email-verification.html"), {
            app: process.env.APP,
        });
    }
    else {
        res
            .status(401)
            .render(path_1.default.join(__dirname, "../views", "email-verification.html"), {
            app: process.env.APP,
        });
    }
});
authRouter.get("/me", authToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    try {
        const user = yield User_1.default.me(id);
        return res.send({ user });
    }
    catch (error) {
        console.log(error);
        Token_1.deleteRefreshToken(res);
        return res.sendStatus(400);
    }
}));
exports.default = authRouter;
//# sourceMappingURL=auth.js.map