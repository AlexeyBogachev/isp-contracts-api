const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const User = require('./User');
const StatusApplication = require('./StatusApplication');
const Tariff = require('./Tariff');

const Application = sequelize.define(
    'application',
    {
        id_application: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        report_card_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Employee,
                key: 'report_card_number',
            },
            onDelete: 'CASCADE',
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id_user',
            },
            onDelete: 'CASCADE',
        },
        id_status_application: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: StatusApplication,
                key: 'id_status_application',
            },
            onDelete: 'CASCADE',
        },
        id_tariff: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Tariff,
                key: 'id_tariff',
            },
            onDelete: 'CASCADE',
        },
        connection_address: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
        date_of_creation: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        cost_application: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        tableName: 'application',
        timestamps: false,
    }
);

Application.belongsTo(Employee, { foreignKey: 'report_card_number' });
Application.belongsTo(User, { foreignKey: 'id_user' });
Application.belongsTo(StatusApplication, { foreignKey: 'id_status_application' });
Application.belongsTo(Tariff, { foreignKey: 'id_tariff' });

module.exports = Application;