const sequelize = require('../config/database');
const Application = require('../models/Application');
const Employee = require('../models/Employee');
const User = require('../models/User');
const StatusApplication = require('../models/StatusApplication');
const Tariff = require('../models/Tariff');

const getApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            include: [
                { model: Employee, attributes: ['surname', 'name', 'report_card_number'] },
                { model: StatusApplication, attributes: ['status_application_name', 'description'] },
                { model: Tariff, attributes: ['tariff_name', 'speed_mbps', 'price'] },
            ],
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
            } else {
                application.dataValues.user = null;
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
    const { id_user, id_status_application, id_tariff } = req.body;

    try {
        if (!id_user || !id_status_application || !id_tariff) {
            return res.status(400).json({ message: 'Ошибка: Все поля должны быть заполнены' });
        }

        const managers = await Employee.findAll({ where: { id_role: 2 } });
        if (managers.length === 0) {
            return res.status(404).json({ message: 'Ошибка: Нет доступных менеджеров' });
        }
        const randomManager = managers[Math.floor(Math.random() * managers.length)];

        const userExists = await User.findByPk(id_user);
        const statusExists = await StatusApplication.findByPk(id_status_application);
        const tariffExists = await Tariff.findByPk(id_tariff);

        if (!userExists || !statusExists || !tariffExists) {
            return res.status(404).json({ message: 'Ошибка: Невалидные данные для заявки' });
        }

        const newApplication = await Application.create({
            report_card_number: randomManager.report_card_number,
            id_user,
            id_status_application,
            id_tariff,
            date_of_creation: new Date(),
        });

        res.status(201).json(newApplication);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании заявки: ' + err.message });
    }
};

const updateApplication = async (req, res) => {
    const { id } = req.params;
    const { report_card_number, id_user, id_status_application, id_tariff, date_of_creation } = req.body;

    try {
        const application = await Application.findOne({ where: { id_application: id } });

        if (!application) {
            return res.status(404).json({ message: 'Заявка с таким ID не найдена' });
        }

        application.report_card_number = report_card_number || application.report_card_number;
        application.id_user = id_user || application.id_user;
        application.id_status_application = id_status_application || application.id_status_application;
        application.id_tariff = id_tariff || application.id_tariff;
        application.date_of_creation = date_of_creation || application.date_of_creation;

        await application.save();
        res.json(application);
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

module.exports = {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    hasActiveApplication
};