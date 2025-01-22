"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetToken = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("../config/config");
const userModel_1 = __importDefault(require("./userModel"));
class PasswordResetToken extends sequelize_1.Model {
}
exports.PasswordResetToken = PasswordResetToken;
PasswordResetToken.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: userModel_1.default,
            key: 'id'
        }
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    expiryDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: config_1.sequelize,
    modelName: 'PasswordResetToken',
});
//# sourceMappingURL=resetPassword.js.map