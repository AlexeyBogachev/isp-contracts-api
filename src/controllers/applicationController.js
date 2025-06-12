const sequelize = require('../config/database');
const Application = require('../models/Application');
const Employee = require('../models/Employee');
const User = require('../models/User');
const StatusApplication = require('../models/StatusApplication');
const Tariff = require('../models/Tariff');
const LegalEntity = require('../models/LegalEntity');
const NaturalPerson = require('../models/NaturalPerson');

const getApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            include: [
                {
                    model: StatusApplication,
                    attributes: ['id_status_application', 'status_application_name', 'description'],
                    required: true
                },
                {
                    model: Tariff,
                    attributes: ['id_tariff', 'tariff_name', 'speed_mbps', 'price'],
                    required: true
                },
                {
                    model: Employee,
                    attributes: ['surname', 'name', 'report_card_number'],
                    required: false
                }
            ],
            attributes: [
                'id_application',
                'connection_address',
                'date_of_creation',
                'cost_application',
                'id_user',
                'id_status_application',
                'id_tariff'
            ]
        });

        for (let application of applications) {
            const { id_user } = application;

            const [user] = await sequelize.query(
                `SELECT * FROM decrypted_users WHERE id_user = :id_user`,
                { replacements: { id_user }, type: sequelize.QueryTypes.SELECT }
            );

            if (user) {
                application.dataValues.user = {
                    phone_number: user.phone_number,
                    email: user.email
                };

                const [naturalPerson] = await sequelize.query(
                    'SELECT * FROM decrypted_natural_persons WHERE id_user = :id_user',
                    { replacements: { id_user }, type: sequelize.QueryTypes.SELECT }
                );

                if (naturalPerson) {
                    application.dataValues.userDetails = {
                        type: 'natural',
                        fullName: `${naturalPerson.surname} ${naturalPerson.name} ${naturalPerson.patronymic}`,
                        dateOfBirth: naturalPerson.date_of_birth,
                        residentialAddress: naturalPerson.residential_address,
                        passportData: `${naturalPerson.passport_series} ${naturalPerson.passport_number}`
                    };
                } else {
                    const legalEntity = await LegalEntity.findOne({ where: { id_user } });
                    if (legalEntity) {
                        application.dataValues.userDetails = {
                            type: 'legal',
                            companyName: legalEntity.name,
                            tin: legalEntity.tin,
                            registrationNumber: legalEntity.registration_number,
                            directorFullName: legalEntity.director_full_name,
                            contactPerson: legalEntity.contact_person,
                            contactPhone: legalEntity.contact_phone,
                            legalAddress: legalEntity.legal_address,
                            website: legalEntity.website
                        };
                    }
                }
            } else {
                application.dataValues.user = null;
                application.dataValues.userDetails = null;
            }
        }

        res.json(applications);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const getApplicationById = async (req, res) => {
    const { id } = req.params;
    try {
        const application = await Application.findOne({
            where: { id_application: id },
            include: [
                { model: Employee, attributes: ['surname', 'name'] },
                { model: User, attributes: ['phone_number', 'email'] },
                { model: StatusApplication, attributes: ['status_application_name'] },
            ],
        });

        if (!application) {
            return res.status(404).json({ message: 'Заявка с таким ID не найдена' });
        }

        res.json(application);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const createApplication = async (req, res) => {
    const {
        id_user,
        id_tariff,
        connection_address,
        connection_entrance,
        connection_floor,
        connection_apartment,
        base_connection_address,
        cost_application,
        natural_person_data,
        legal_entity_data
    } = req.body;

    try {
        if (!id_user || !id_tariff || !connection_address) {
            return res.status(400).json({ message: 'Ошибка: Обязательные поля должны быть заполнены' });
        }

        const [userExists, tariffExists] = await Promise.all([
            User.findByPk(id_user),
            Tariff.findByPk(id_tariff)
        ]);

        if (!userExists) {
            return res.status(404).json({ message: 'Ошибка: Пользователь не найден' });
        }

        if (!tariffExists) {
            return res.status(404).json({ message: 'Ошибка: Тариф не найден' });
        }

        let existingNaturalPerson = null;
        let existingLegalEntity = null;

        if (natural_person_data) {
            existingLegalEntity = await LegalEntity.findOne({ where: { id_user } });
            if (existingLegalEntity) {
                return res.status(400).json({
                    message: 'Ошибка: Пользователь уже зарегистрирован как юридическое лицо'
                });
            }
        }

        if (legal_entity_data) {
            try {
                [existingNaturalPerson] = await sequelize.query(
                    'SELECT id_user FROM natural_person WHERE id_user = :id_user',
                    {
                        replacements: { id_user },
                        type: sequelize.QueryTypes.SELECT
                    }
                );
            } catch (error) {
                existingNaturalPerson = null;
            }

            if (existingNaturalPerson) {
                return res.status(400).json({
                    message: 'Ошибка: Пользователь уже зарегистрирован как физическое лицо'
                });
            }
        }

        const managers = await Employee.findAll({
            where: { id_role: 2 },
            attributes: ['report_card_number', 'surname', 'name']
        });

        if (managers.length === 0) {
            return res.status(404).json({ message: 'Ошибка: Нет доступных менеджеров' });
        }

        const randomManager = managers[Math.floor(Math.random() * managers.length)];

        const defaultStatus = await StatusApplication.findOne({ where: { id_status_application: 1 } });
        if (!defaultStatus) {
            return res.status(500).json({ message: 'Ошибка: Не найден статус по умолчанию' });
        }

        const applicationData = {
            report_card_number: randomManager.report_card_number,
            id_user,
            id_status_application: defaultStatus.id_status_application,
            id_tariff,
            connection_address: connection_address.trim(),
            connection_entrance: connection_entrance?.trim() || null,
            connection_floor: connection_floor?.trim() || null,
            connection_apartment: connection_apartment?.trim() || null,
            base_connection_address: (base_connection_address || connection_address).trim(),
            date_of_creation: new Date(),
            cost_application: cost_application || 4500.00
        };

        const newApplication = await Application.create(applicationData);

        if (natural_person_data) {
            try {
                const {
                    surname,
                    name,
                    patronymic,
                    date_of_birth,
                    gender,
                    residential_address,
                    passport_series,
                    passport_number
                } = natural_person_data;

                const existingPerson = await NaturalPerson.findOne({ where: { id_user } });

                if (existingPerson) {
                    await existingPerson.update({
                        surname: surname.trim(),
                        name: name.trim(),
                        patronymic: patronymic?.trim() || null,
                        date_of_birth,
                        gender,
                        residential_address: residential_address.trim(),
                        passport_series: passport_series.trim(),
                        passport_number: passport_number.trim()
                    });
                }
            } catch (updateError) {
                throw updateError;
            }
        }

        if (legal_entity_data) {
            try {
                const legalEntityDataForDB = {
                    id_user,
                    name: legal_entity_data.name?.trim(),
                    tin: legal_entity_data.tin?.trim(),
                    registration_number: legal_entity_data.registration_number?.trim(),
                    director_full_name: legal_entity_data.director_full_name?.trim(),
                    contact_person: legal_entity_data.contact_person?.trim(),
                    contact_phone: legal_entity_data.contact_phone?.trim(),
                    legal_address: legal_entity_data.legal_address?.trim(),
                    website: legal_entity_data.website?.trim() || null
                };

                const [existingEntity, created] = await LegalEntity.findOrCreate({
                    where: { id_user },
                    defaults: legalEntityDataForDB
                });

                if (!created) {
                    await existingEntity.update(legalEntityDataForDB);
                }
            } catch (error) {
                throw new Error(`Ошибка при обработке данных юридического лица: ${error.message}`);
            }
        }

        const createdApplication = await Application.findOne({
            where: { id_application: newApplication.id_application },
            include: [
                {
                    model: StatusApplication,
                    attributes: ['id_status_application', 'status_application_name', 'description'],
                    required: true
                },
                {
                    model: Tariff,
                    attributes: ['id_tariff', 'tariff_name', 'speed_mbps', 'price'],
                    required: true
                },
                {
                    model: Employee,
                    attributes: ['surname', 'name', 'report_card_number'],
                    required: false
                }
            ]
        });

        res.status(201).json(createdApplication);
    } catch (err) {
        res.status(500).json({
            error: 'Ошибка при создании заявки',
            message: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const updateApplication = async (req, res) => {
    const { id } = req.params;
    const {
        report_card_number,
        id_user,
        id_status_application,
        id_tariff,
        connection_address,
        cost_application
    } = req.body;

    try {
        const application = await Application.findOne({
            where: { id_application: id },
            include: [
                {
                    model: StatusApplication,
                    attributes: ['id_status_application', 'status_application_name', 'description'],
                    required: true
                },
                {
                    model: Tariff,
                    attributes: ['id_tariff', 'tariff_name', 'speed_mbps', 'price'],
                    required: true
                },
                {
                    model: Employee,
                    attributes: ['surname', 'name', 'report_card_number'],
                    required: false
                }
            ]
        });

        if (!application) {
            return res.status(404).json({ message: 'Заявка с таким ID не найдена' });
        }

        if (report_card_number) application.report_card_number = report_card_number;
        if (id_user) application.id_user = id_user;
        if (id_status_application) application.id_status_application = id_status_application;
        if (id_tariff) application.id_tariff = id_tariff;
        if (connection_address) application.connection_address = connection_address;
        if (cost_application !== undefined) application.cost_application = cost_application;

        await application.save();

        const updatedApplication = await Application.findOne({
            where: { id_application: id },
            include: [
                {
                    model: StatusApplication,
                    attributes: ['id_status_application', 'status_application_name', 'description'],
                    required: true
                },
                {
                    model: Tariff,
                    attributes: ['id_tariff', 'tariff_name', 'speed_mbps', 'price'],
                    required: true
                },
                {
                    model: Employee,
                    attributes: ['surname', 'name', 'report_card_number'],
                    required: false
                }
            ]
        });

        res.json(updatedApplication);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении заявки: ' + err.message });
    }
};

const deleteApplication = async (req, res) => {
    const { id } = req.params;
    try {
        const application = await Application.findOne({ where: { id_application: id } });

        if (!application) {
            return res.status(404).json({ message: 'Заявка с таким ID не найдена' });
        }

        await application.destroy();
        res.status(204).json({ message: 'Заявка удалена' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении заявки: ' + err.message });
    }
};

const hasActiveApplication = async (req, res) => {
    const { id_user } = req.params;

    try {
        const activeStatuses = [1, 2];
        const application = await Application.findOne({
            where: {
                id_user,
                id_status_application: activeStatuses
            }
        });

        res.json({ hasActive: !!application });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при проверке заявки: ' + err.message });
    }
};

const getActiveApplicationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const activeApplications = await Application.findAll({
            where: {
                id_user: userId,
                id_status_application: [1, 2]
            },
            include: [
                {
                    model: StatusApplication,
                    attributes: ['status_application_name'],
                    required: true
                }
            ]
        });

        res.json(activeApplications);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при проверке активных заявок: ' + err.message });
    }
};

module.exports = {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    hasActiveApplication,
    getActiveApplicationsByUser
};