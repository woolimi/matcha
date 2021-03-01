"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const profile_1 = __importDefault(require("./routes/api/profile"));
const auth_1 = __importDefault(require("./routes/auth"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const check_1 = __importDefault(require("./routes/api/check"));
const path_1 = __importDefault(require("path"));
const Database_1 = __importDefault(require("./init/Database"));
const socket_io_1 = require("socket.io");
const notifications_1 = __importDefault(require("./routes/api/notifications"));
const chat_1 = __importDefault(require("./routes/api/chat"));
const request_ip_1 = __importDefault(require("request-ip"));
const tags_1 = __importDefault(require("./routes/api/tags"));
const Socket_1 = require("./services/Socket");
const search_1 = __importDefault(require("./routes/api/search"));
const like_1 = __importDefault(require("./routes/api/like"));
const block_1 = __importDefault(require("./routes/api/block"));
const report_1 = __importDefault(require("./routes/api/report"));
const https_1 = __importDefault(require("https"));
dotenv_1.default.config();
const corsConfig = {
    origin: [process.env.APP || "http://localhost:3000"],
    credentials: true,
};
const app = express_1.default();
app.users = {};
app.sockets = {};
app.currentPage = {};
Database_1.default.init();
const upload_path = process.env.ENVIRONMENT === "build" || process.env.ENVIRONMENT === "prod"
    ? path_1.default.resolve(__dirname, "..", "uploads")
    : path_1.default.resolve(__dirname, "uploads");
app.use("/uploads", express_1.default.static(upload_path));
app.use(express_1.default.json());
app.use(cors_1.default(corsConfig));
app.use(cookie_parser_1.default());
app.use(request_ip_1.default.mw());
app.use("/check", check_1.default);
app.use("/auth", auth_1.default);
app.use("/api/profile", profile_1.default);
app.use("/api/tags", tags_1.default);
app.use("/api/search", search_1.default);
app.use("/api/like", like_1.default);
app.use("/api/block", block_1.default);
app.use("/api/report", report_1.default);
app.use("/api/notifications", notifications_1.default);
app.use("/api/chat", chat_1.default);
const server = https_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [process.env.APP || "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
Socket_1.bindSocket(app, io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at ${process.env.API}`);
});
//# sourceMappingURL=index.js.map