import * as dotenv from 'dotenv';
import { Dialect, Sequelize } from 'sequelize';
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
        dialect: 'mysql' as Dialect,
        logging: false,
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected");

        // Manually synchronize each model
        await User.sync(); // Syncs the User model
        console.log("User model synchronized");

        await Task.sync(); // Syncs the Task model
        console.log("Task model synchronized");

        await UserProfile.sync(); // Syncs the UserProfile model
        console.log("UserProfile model synchronized");

        await PasswordResetToken.sync(); // Syncs the PasswordResetToken model
        console.log("PasswordResetToken model synchronized");
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};
