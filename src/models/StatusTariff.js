const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StatusTariff = sequelize.define(
    'status_tariff',
    {
        id_status_tariff: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tariff_status_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'status_tariff',
        timestamps: false,
    }
);

module.exports = StatusTariff;