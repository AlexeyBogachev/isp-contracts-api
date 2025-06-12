const NaturalPerson = require('../models/NaturalPerson');
const User = require('../models/User');
const LegalEntity = require('../models/LegalEntity');
const sequelize = require('../config/database');

const getNaturalPersons = async (req, res) => {
    try {
        const naturalPersons = await sequelize.query(
            'SELECT * FROM decrypted_natural_persons',
            { type: sequelize.QueryTypes.SELECT }
        );
        res.json(naturalPersons);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const getNaturalPersonByUserId = async (req, res) => {
    const { id } = req.params;
    try {
        const [naturalPerson] = await sequelize.query(
            'SELECT * FROM decrypted_natural_persons WHERE id_user = :id',
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(naturalPerson || null);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const createNaturalPerson = async (req, res) => {
    try {
        const { id_user, date_of_birth } = req.body;

        const birthDate = new Date(date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

        if (birthDate > today) {
            return res.status(400).json({
                error: 'Ошибка валидации',
                message: 'Дата рождения не может быть в будущем'
            });
        }

        if (adjustedAge < 18) {
            return res.status(400).json({
                error: 'Ошибка валидации',
                message: 'Возраст должен быть не менее 18 лет'
            });
        }

        if (adjustedAge > 120) {
            return res.status(400).json({
                error: 'Ошибка валидации',
                message: 'Указан некорректный возраст'
            });
        }

        const legalEntity = await LegalEntity.findOne({ where: { id_user } });

        if (legalEntity) {
            return res.status(400).json({
                error: 'Ошибка создания физического лица',
                message: 'Пользователь уже зарегистрирован как юридическое лицо'
            });
        }

        const userExists = await User.findByPk(id_user);
        if (!userExists) {
            return res.status(404).json({ message: 'Пользователь с таким ID не существует' });
        }

        const [existingPerson] = await sequelize.query(
            'SELECT id_user FROM natural_person WHERE id_user = :id_user',
            {
                replacements: { id_user },
                type: sequelize.QueryTypes.SELECT
            }
        );

        const {
            surname,
            name,
            patronymic,
            gender,
            residential_address,
            passport_series,
            passport_number
        } = req.body;

        if (existingPerson) {
            await sequelize.query(
                `UPDATE natural_person 
                 SET surname = :surname, 
                     name = :name, 
                     patronymic = :patronymic, 
                     date_of_birth = :date_of_birth, 
                     gender = :gender, 
                     residential_address = :residential_address,
                     passport_series = :passport_series,
                     passport_number = :passport_number
                 WHERE id_user = :id_user`,
                {
                    replacements: {
                        id_user,
                        surname: surname.trim(),
                        name: name.trim(),
                        patronymic: patronymic?.trim() || null,
                        date_of_birth,
                        gender,
                        residential_address: residential_address.trim(),
                        passport_series: passport_series.trim(),
                        passport_number: passport_number.trim()
                    },
                    type: sequelize.QueryTypes.UPDATE
                }
            );
        } else {
            await sequelize.query(
                `INSERT INTO natural_person (
                    id_user, surname, name, patronymic, date_of_birth, gender,
                    residential_address, passport_series, passport_number
                ) VALUES (
                    :id_user, :surname, :name, :patronymic, :date_of_birth, :gender,
                    :residential_address, :passport_series, :passport_number
                )`,
                {
                    replacements: {
                        id_user,
                        surname: surname.trim(),
                        name: name.trim(),
                        patronymic: patronymic?.trim() || null,
                        date_of_birth,
                        gender,
                        residential_address: residential_address.trim(),
                        passport_series: passport_series.trim(),
                        passport_number: passport_number.trim()
                    },
                    type: sequelize.QueryTypes.INSERT
                }
            );
        }

        const [updatedPerson] = await sequelize.query(
            'SELECT * FROM decrypted_natural_persons WHERE id_user = :id_user',
            {
                replacements: { id_user },
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.status(201).json(updatedPerson);
    } catch (err) {
        res.status(500).json({
            error: 'Ошибка при создании/обновлении физического лица',
            message: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const updateNaturalPerson = async (req, res) => {
    const { id } = req.params;
    const { surname, name, patronymic, date_of_birth, gender, residential_address, passport_number, passport_series } = req.body;

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