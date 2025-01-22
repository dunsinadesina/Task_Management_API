"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = require("../config/config");
class UserProfile extends sequelize_1.Model {
}
UserProfile.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    userid: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isLoggedIn: {
        type: sequelize_1.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: config_1.sequelize,
    tableName: 'userprofiles',
    timestamps: true
});
exports.default = UserProfile; //export the model to use in other files
//# sourceMappingURL=userProfileModel.js.map