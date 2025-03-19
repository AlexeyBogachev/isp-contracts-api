const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./Role');
const bcrypt = require('bcryptjs');

const Employee = sequelize.define(
    'employee',
    {
        report_card_number: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Role,
                key: 'id_role',
            },
            onDelete: 'CASCADE',
        },
        phone_number: {
            type: DataTypes.STRING(225),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(225),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        surname: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        patronymic: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        gender: {
            type: DataTypes.CHAR(1),
            allowNull: false,
            validate: {
                isIn: [['М', 'Ж']],
            },
        },
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        residential_address: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
        photo: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        acceptance_date_work: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_of_violation: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'employee',
        timestamps: false,
    }
);

Employee.belongsTo(Role, { foreignKey: 'id_role' });

module.exports = Employee;