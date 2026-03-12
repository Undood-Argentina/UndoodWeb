import {Model, DataTypes, Sequelize} from "sequelize";
import {conectDB} from "../config";

// Campaign disabled — skip DB connection
const CHRISTMAS_DISABLED = true;

const sequelize = CHRISTMAS_DISABLED
    ? (null as unknown as Sequelize)
    : await conectDB();

class User extends Model {}
User.init({
    idusers: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    cel:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    company:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    childrenid:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    register_date:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    sequelize,
    timestamps: false,
    modelName: "users"
});

class Child extends Model {}
Child.init({
    idchildren: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    house: {
        type: DataTypes.STRING,
        allowNull: false
    },
    card:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    available:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    gifts:{
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    timestamps: false,
    modelName: "childrens"
});

class RetPoint extends Model {}
RetPoint.init({
    idretirement_point: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cel: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    responsible_name:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    availability_time:{
        type: DataTypes.JSON,
        allowNull: false,
    },
    location_link:{
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    timestamps: false,
    modelName: "retirement_points"
});

export {User, Child, RetPoint};