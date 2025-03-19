const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');
const Application = require('./Application');
const StatusContract = require('./StatusContract');
const Tariff = require('./Tariff');

const Contract = sequelize.define(
    'contract',
    {
        id_contract: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_status_contract: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: StatusContract,
                key: 'id_status_contract',
            },
            onDelete: 'CASCADE',
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
        id_application: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Application,
                key: 'id_application',
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
        face_account: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        total_cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        data_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date_of_conclusion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_of_termination: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        reason_for_termination_of_agreement: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        contract_terms: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'contract',
        timestamps: false,
    }
);

Contract.belongsTo(StatusContract, { foreignKey: 'id_status_contract' });
Contract.belongsTo(Employee, { foreignKey: 'report_card_number' });
Contract.belongsTo(Application, { foreignKey: 'id_application' });
Contract.belongsTo(Tariff, { foreignKey: 'id_tariff' });

module.exports = Contract;