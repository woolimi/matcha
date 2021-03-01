"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requireNotSelf = (req, res, next) => {
    var _a, _b;
    const id = parseInt((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    const self = parseInt((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
    if (isNaN(id) || isNaN(self))
        res.status(400).json({ error: 'Invalid or missing ID' });
    if (id == self)
        res.status(400).json({ error: 'You cannot interact with yourself here !' });
    next();
};
exports.default = requireNotSelf;
//# sourceMappingURL=requireNotSelf.js.map