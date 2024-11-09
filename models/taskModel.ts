import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/config';
import User from './userModel';

interface TaskAttributes {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    completed: boolean;
    userId: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public dueDate!: Date;
    public completed!: boolean;
    public userId!: string;
    public priority!: 'low' | 'medium' | 'high';
    public status!: 'pending' | 'in-progress' | 'completed' | 'on-hold';
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Task.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'on-hold'),
        defaultValue: 'pending',
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'tasks',
    timestamps: true
});

export default Task;