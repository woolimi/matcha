"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ll2xy = exports.xy2ll = void 0;
function xy2ll(xy) {
    return {
        lat: xy.y,
        lng: xy.x,
    };
}
exports.xy2ll = xy2ll;
function ll2xy(ll) {
    return {
        x: ll.lng,
        y: ll.lat,
    };
}
exports.ll2xy = ll2xy;
//# sourceMappingURL=Location.js.map