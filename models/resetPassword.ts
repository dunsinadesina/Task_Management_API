import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/config';
import User from './userModel';

interface PasswordResetTokenAttributes {
    id: string,
    userId: string,
    token: string,
    expiryDate: Date
}

interface PasswordResetTokenCreationAttributes extends Optional<PasswordResetTokenAttributes, 'id'> { }

class PasswordResetToken extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes> implements PasswordResetTokenAttributes {
    public id!: string;
    public userId!: string;
    public token!: string;
    public expiryDate!: Date;
}

PasswordResetToken.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
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
}, {
    sequelize,
    modelName: 'PasswordResetToken',
})

export { PasswordResetToken };

