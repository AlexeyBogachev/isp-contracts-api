const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const StatusTariff = require('./StatusTariff');

const Tariff = sequelize.define(
    'tariff',
    {
        id_tariff: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_status_tariff: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: StatusTariff,
                key: 'id_status_tariff',
            },
            onDelete: 'CASCADE',
        },
        tariff_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        speed_mbps: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'tariff',
        timestamps: false,
    }
);

Tariff.belongsTo(StatusTariff, { foreignKey: 'id_status_tariff' });

module.exports = Tariff;