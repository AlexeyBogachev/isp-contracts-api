const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const User = require('./User');
const StatusApplication = require('./StatusApplication');

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
        date_of_creation: {
            type: DataTypes.DATE,
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

module.exports = Application;