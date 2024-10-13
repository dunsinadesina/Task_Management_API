import { DataTypes } from 'sequelize';
import { sequelize } from '../config/config';
import User from './userModel';

const PasswordResetToken = sequelize.define('PasswordResetToken', {
    userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
});
export { PasswordResetToken };
