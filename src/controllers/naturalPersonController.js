const NaturalPerson = require('../models/NaturalPerson');
const User = require('../models/User');

const getNaturalPersons = async (req, res) => {
    try {
        const naturalPersons = await NaturalPerson.findAll();
        res.json(naturalPersons);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const getNaturalPersonByUserId = async (req, res) => {
    const { id } = req.params; // id пользователя
    try {
        const naturalPerson = await NaturalPerson.findOne({ where: { id_user: id } });
        if (!naturalPerson) {
            return res.status(404).json({ message: 'Человек с таким ID не найден' });
        }
        res.json(naturalPerson);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const createNaturalPerson = async (req, res) => {
    const { id_user, surname, name, patronymic, date_of_birth, gender, registration_address, residential_address, passport_number, passport_series } = req.body;
    
    try {
        const userExists = await User.findByPk(id_user);
        if (!userExists) {
            return res.status(404).json({ message: 'Пользователь с таким ID не существует' });
        }

        const newNaturalPerson = await NaturalPerson.create({
            id_user,
            surname,
            name,
            patronymic,
            date_of_birth,
            gender,
            registration_address,
            residential_address,
            passport_number,
            passport_series,
        });
        res.status(201).json(newNaturalPerson);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании человека: ' + err.message });
    }
};

const updateNaturalPerson = async (req, res) => {
    const { id } = req.params;
    const { surname, name, patronymic, date_of_birth, gender, registration_address, residential_address, passport_number, passport_series } = req.body;
    
    try {
        const naturalPerson = await NaturalPerson.findOne({ where: { id_user: id } });
        if (!naturalPerson) {
            return res.status(404).json({ message: 'Человек с таким ID не найден' });
        }

        naturalPerson.surname = surname || naturalPerson.surname;
        naturalPerson.name = name || naturalPerson.name;
        naturalPerson.patronymic = patronymic || naturalPerson.patronymic;
        naturalPerson.date_of_birth = date_of_birth || naturalPerson.date_of_birth;
        naturalPerson.gender = gender || naturalPerson.gender;
        naturalPerson.registration_address = registration_address || naturalPerson.registration_address;
        naturalPerson.residential_address = residential_address || naturalPerson.residential_address;
        naturalPerson.passport_number = passport_number || naturalPerson.passport_number;
        naturalPerson.passport_series = passport_series || naturalPerson.passport_series;

        await naturalPerson.save();
        res.json(naturalPerson);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении данных: ' + err.message });
    }
};

const deleteNaturalPerson = async (req, res) => {
    const { id } = req.params;
    try {
        const naturalPerson = await NaturalPerson.findOne({ where: { id_user: id } });
        if (!naturalPerson) {
            return res.status(404).json({ message: 'Человек с таким ID не найден' });
        }
        await naturalPerson.destroy();
        res.status(204).json({ message: 'Человек удалён' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении данных: ' + err.message });
    }
};

module.exports = {
    getNaturalPersons,
    getNaturalPersonByUserId,
    createNaturalPerson,
    updateNaturalPerson,
    deleteNaturalPerson
};