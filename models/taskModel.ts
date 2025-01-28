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
    subtasks: any[];
    estimatedTime: { hours: number; minutes: number };
    tags: string[];
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
    createdAt?: Date;
    updatedAt?: Date;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id'> { }

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public dueDate!: Date;
    public completed!: boolean;
    public userId!: string;
    public priority!: 'low' | 'medium' | 'high';
    public status!: 'pending' | 'in-progress' | 'completed' | 'on-hold';
    public subtasks!: any[];
    public estimatedTime!: { hours: number; minutes: number };
    public tags!: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Task.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            defaultValue: 'medium',
        },
        status: {
            type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'on-hold'),
            defaultValue: 'pending',
        },
        subtasks: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidArray(value: any) {
                    if (value && !Array.isArray(value)) {
                        throw new Error('Subtasks must be an array');
                    }
                },
            },
        },
        estimatedTime: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidTime(value: any) {
                    if (value && (typeof value.hours !== 'number' || typeof value.minutes !== 'number')) {
                        throw new Error('Estimated time must contain hours and minutes as numbers');
                    }
                },
            },
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidTags(value: any) {
                    if (value && !Array.isArray(value)) {
                        throw new Error('Tags must be an array of strings');
                    }
                }
            }
        },
    },
    {
        sequelize,
        tableName: 'tasks',
        timestamps: true,
        paranoid: true, // Enable soft deletes
    }
);

Task.belongsTo(User, { foreignKey: 'userId', as: 'users' });
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });

export default Task;