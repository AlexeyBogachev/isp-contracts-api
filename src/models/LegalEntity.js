const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const LegalEntity = sequelize.define(
    'legal_entity', 
    {
        id_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: User,
                key: 'id_user'
            },
            onDelete: 'CASCADE',
            unique: true
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        tin: {
            type: DataTypes.STRING(12),
            allowNull: false,
            unique: true
        },
        registration_number: {
            type: DataTypes.STRING(13),
            allowNull: false,
            unique: true
        },
        director_full_name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        contact_person: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        contact_phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        actual_address: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        legal_address: {
            type: DataTypes.STRING(300),
            allowNull: true
        },
        website: {
            type: DataTypes.STRING(300),
            allowNull: true
        }
    }, 
    {
        tableName: 'legal_entity',
        timestamps: false
    }
);

LegalEntity.belongsTo(User, { foreignKey: 'id_user', targetKey: 'id_user' });

module.exports = LegalEntity;