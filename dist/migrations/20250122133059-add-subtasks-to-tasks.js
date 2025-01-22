"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addColumn('tasks', 'subtasks', {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
        });
        await queryInterface.addColumn('tasks', 'estimatedTime', {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
        });
        await queryInterface.addColumn('tasks', 'tags', {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('tasks', 'subtasks');
        await queryInterface.removeColumn('tasks', 'estimatedTime');
        await queryInterface.removeColumn('tasks', 'tags');
    },
};
//# sourceMappingURL=20250122133059-add-subtasks-to-tasks.js.map