import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { PasswordResetToken } from '../models/resetPassword';
import Task from '../models/taskModel';
import User from '../models/userModel';
import UserProfile from '../models/userProfileModel';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected");
        await sequelize.sync();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};