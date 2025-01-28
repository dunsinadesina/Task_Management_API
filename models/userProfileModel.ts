import { BOOLEAN, DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config";

interface UserProfileAttributes {
    id: string;
    userid: string;
    name: string;
    email: string;
    isLoggedIn: boolean;
}

interface UserProfileCreationAttributes extends Optional<UserProfileAttributes, 'id'> { }

class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> implements UserProfileAttributes {
    public id!: string;
    public userid!: string;
    public name!: string;
    public email!: string;
    public isLoggedIn!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

UserProfile.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userid: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isLoggedIn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    tableName: 'userProfile',
    timestamps: true
})

export default UserProfile;  //export the model to use in other files