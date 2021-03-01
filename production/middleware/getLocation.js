"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const getLocation = (req, res, next) => {
    var _a;
    const uinfo = req.body;
    const clientIp = req.clientIp;
    const default_location = { lat: 48.8566, lng: 2.3522 };
    if (!lodash_1.default.isEmpty(uinfo.location))
        return next();
    if (!clientIp)
        return default_location;
    const found_ll = (_a = geoip_lite_1.default.lookup(clientIp)) === null || _a === void 0 ? void 0 : _a.ll;
    uinfo.location = found_ll ? { lat: found_ll[0], lng: found_ll[1] } : default_location;
    return next();
};
exports.default = getLocation;
//# sourceMappingURL=getLocation.js.map