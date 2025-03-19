const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define(
    'role',
    {
        id_role: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        role_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
    },
    {
        tableName: 'role',
        timestamps: false,
    }
);

module.exports = Role;