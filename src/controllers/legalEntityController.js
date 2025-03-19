const LegalEntity = require('../models/LegalEntity');
const User = require('../models/User');

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
        if (!legalEntity) {
            return res.status(404).json({ message: 'Юридическое лицо с таким ID не найдено' });
        }
        res.json(legalEntity);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const createLegalEntity = async (req, res) => {
    const { id_user, name, TIN, registration_number, director_full_name, contact_person, contact_phone, actual_address, legal_address, website } = req.body;
    
    try {
        const userExists = await User.findByPk(id_user);
        if (!userExists) {
            return res.status(404).json({ message: 'Пользователь с таким ID не существует' });
        }

        const newLegalEntity = await LegalEntity.create({
            id_user,
            name,
            TIN,
            registration_number,
            director_full_name,
            contact_person,
            contact_phone,
            actual_address,
            legal_address,
            website,
        });
        res.status(201).json(newLegalEntity);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании юридического лица: ' + err.message });
    }
};

const updateLegalEntity = async (req, res) => {
    const { id } = req.params;
    const { name, TIN, registration_number, director_full_name, contact_person, contact_phone, actual_address, legal_address, website } = req.body;
    
    try {
        const legalEntity = await LegalEntity.findOne({ where: { id_user: id } });
        if (!legalEntity) {
            return res.status(404).json({ message: 'Юридическое лицо с таким ID не найдено' });
        }

        legalEntity.name = name || legalEntity.name;
        legalEntity.TIN = TIN || legalEntity.TIN;
        legalEntity.registration_number = registration_number || legalEntity.registration_number;
        legalEntity.director_full_name = director_full_name || legalEntity.director_full_name;
        legalEntity.contact_person = contact_person || legalEntity.contact_person;
        legalEntity.contact_phone = contact_phone || legalEntity.contact_phone;
        legalEntity.actual_address = actual_address || legalEntity.actual_address;
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