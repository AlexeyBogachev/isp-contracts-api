const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
    'user',
    {
        id_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(900),
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING(225),
            allowNull: false,
        },
    },
    {
        tableName: 'user',
        timestamps: false,
    }
);

module.exports = User;