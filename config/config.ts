import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql'
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected");
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};