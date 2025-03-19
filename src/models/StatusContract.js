const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StatusContract = sequelize.define(
    'status_contract',
    {
        id_status_contract: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        status_contract_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'status_contract',
        timestamps: false,
    }
);

module.exports = StatusContract;