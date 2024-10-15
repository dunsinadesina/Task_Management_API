import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/config';
import User from './userModel';

interface TaskAttributes {
    id: string;
    title: string;
    description: string;
    dueDate: Date,
    completed: boolean,
    userId: string,
    priority: 'low' | 'medium' | 'on-hold',
    status: 'pending' | 'in-progress' | 'completed' | 'on_hold'
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public dueDate!: Date;
    public completed!: boolean;
    public userId!: string;
    public priority!: 'low' | 'medium' | 'on-hold';
    public status!: 'completed' | 'pending' | 'in-progress' | 'on_hold';
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Task.init({
    id: {
        type: DataTypes.STRING,
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
    completed:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references:{
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
})

export default Task;  //export the model to use in other files