const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const NaturalPerson = sequelize.define(
    'natural_person',
    {
        id_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: User,
                key: 'id_user',
            },
            unique: true
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
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        gender: {
            type: DataTypes.CHAR(1),
            allowNull: false,
            validate: {
                isIn: [['М', 'Ж']],
            },
        },
        registration_address: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        residential_address: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
        passport_number: {
            type: DataTypes.STRING(225),
            allowNull: false,
        },
        passport_series: {
            type: DataTypes.STRING(225),
            allowNull: false,
        },
    },
    {
        tableName: 'natural_person',
        timestamps: false,
    }
);

NaturalPerson.belongsTo(User, { foreignKey: 'id_user', targetKey: 'id_user' });

module.exports = NaturalPerson;