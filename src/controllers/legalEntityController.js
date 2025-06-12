const LegalEntity = require('../models/LegalEntity');
const User = require('../models/User');
const NaturalPerson = require('../models/NaturalPerson');

const getLegalEntities = async (req, res) => {
    try {
        const legalEntities = await LegalEntity.findAll();
        res.json(legalEntities);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const getLegalEntityByUserId = async (req, res) => {
    const { id } = req.params;
    try {
        const legalEntity = await LegalEntity.findOne({ where: { id_user: id } });
        res.json(legalEntity || null);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const createLegalEntity = async (req, res) => {
    const {
        id_user,
        name,
        tin,
        registration_number,
        director_full_name,
        contact_person,
        contact_phone,
        legal_address,
        website
    } = req.body;

    try {
        if (!legal_address) {
            return res.status(400).json({ message: 'Юридический адрес обязателен для заполнения' });
        }

        const userExists = await User.findByPk(id_user);
        if (!userExists) {
            return res.status(404).json({ message: 'Пользователь с таким ID не существует' });
        }

        const naturalPerson = await NaturalPerson.findOne({ where: { id_user } });
        if (naturalPerson) {
            return res.status(400).json({
                error: 'Ошибка создания юридического лица',
                message: 'Пользователь уже зарегистрирован как физическое лицо'
            });
        }

        let legalEntity = await LegalEntity.findOne({ where: { id_user } });

        const entityData = {
            id_user,
            name,
            tin,
            registration_number,
            director_full_name,
            contact_person,
            contact_phone,
            legal_address,
            website
        };

        if (legalEntity) {
            await legalEntity.update(entityData);
        } else {
            legalEntity = await LegalEntity.create(entityData);
        }

        res.status(201).json(legalEntity);
    } catch (err) {
        res.status(500).json({
            error: 'Ошибка при создании/обновлении юридического лица',
            message: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const updateLegalEntity = async (req, res) => {
    const { id } = req.params;
    const { name, tin, registration_number, director_full_name, contact_person, contact_phone, legal_address, website } = req.body;

    try {
        const legalEntity = await LegalEntity.findOne({ where: { id_user: id } });
        if (!legalEntity) {
            return res.status(404).json({ message: 'Юридическое лицо с таким ID не найдено' });
        }

        if (legal_address === null || legal_address === '') {
            return res.status(400).json({ message: 'Юридический адрес не может быть пустым' });
        }

        legalEntity.name = name || legalEntity.name;
        legalEntity.tin = tin || legalEntity.tin;
        legalEntity.registration_number = registration_number || legalEntity.registration_number;
        legalEntity.director_full_name = director_full_name || legalEntity.director_full_name;
        legalEntity.contact_person = contact_person || legalEntity.contact_person;
        legalEntity.contact_phone = contact_phone || legalEntity.contact_phone;
        legalEntity.legal_address = legal_address || legalEntity.legal_address;
        legalEntity.website = website || legalEntity.website;

        await legalEntity.save();
        res.json(legalEntity);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении данных: ' + err.message });
    }
};

const deleteLegalEntity = async (req, res) => {
    const { id } = req.params;
    try {
        const legalEntity = await LegalEntity.findOne({ where: { id_user: id } });
        if (!legalEntity) {
            return res.status(404).json({ message: 'Юридическое лицо с таким ID не найдено' });
        }
        await legalEntity.destroy();
        res.status(204).json({ message: 'Юридическое лицо удалено' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении данных: ' + err.message });
    }
};

module.exports = {
    getLegalEntities,
    getLegalEntityByUserId,
    createLegalEntity,
    updateLegalEntity,
    deleteLegalEntity
};
