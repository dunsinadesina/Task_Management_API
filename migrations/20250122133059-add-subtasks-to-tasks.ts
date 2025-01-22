import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('tasks', 'subtasks', {
      type: DataTypes.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('tasks', 'estimatedTime', {
      type: DataTypes.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('tasks', 'tags', {
      type: DataTypes.JSON,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('tasks', 'subtasks');
    await queryInterface.removeColumn('tasks', 'estimatedTime');
    await queryInterface.removeColumn('tasks', 'tags');
  },
};