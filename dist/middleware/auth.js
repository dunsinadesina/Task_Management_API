"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(400).json({ message: 'No token, authorization denied' });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken.user;
        next();
    }
    catch (error) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};
exports.default = auth;
//# sourceMappingURL=auth.js.map