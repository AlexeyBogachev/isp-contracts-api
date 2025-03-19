const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StatusApplication = sequelize.define('status_application', {
    id_status_application: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status_application_name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'status_application',
    timestamps: false
});

module.exports = StatusApplication;