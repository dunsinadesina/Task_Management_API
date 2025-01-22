"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = require("../config/config");
const userModel_1 = __importDefault(require("./userModel"));
class Task extends sequelize_1.Model {
}
Task.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dueDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    completed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: userModel_1.default,
            key: 'id',
        },
    },
    priority: {
        type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'in-progress', 'completed', 'on-hold'),
        defaultValue: 'pending',
    },
    subtasks: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidArray(value) {
                if (value && !Array.isArray(value)) {
                    throw new Error('Subtasks must be an array');
                }
            },
        },
    },
    estimatedTime: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidTime(value) {
                if (value && (typeof value.hours !== 'number' || typeof value.minutes !== 'number')) {
                    throw new Error('Estimated time must contain hours and minutes as numbers');
                }
            },
        },
    },
    tags: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidTags(value) {
                if (value && !Array.isArray(value)) {
                    throw new Error('Tags must be an array of strings');
                }
            }
        }
    },
}, {
    sequelize: config_1.sequelize,
    tableName: 'tasks',
    timestamps: true,
    paranoid: true, // Enable soft deletes
});
Task.belongsTo(userModel_1.default, { foreignKey: 'userId', as: 'user' });
userModel_1.default.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
exports.default = Task;
//# sourceMappingURL=taskModel.js.map