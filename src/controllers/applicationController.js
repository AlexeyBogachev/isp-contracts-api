const Application = require('../models/Application');
const Employee = require('../models/Employee');
const User = require('../models/User');
const StatusApplication = require('../models/StatusApplication');

const getApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            include: [
                { model: Employee, attributes: ['surname', 'name'] },
                { model: User, attributes: ['phone_number', 'email'] },
                { model: StatusApplication, attributes: ['status_application_name'] },
            ],
        });
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
    const { report_card_number, id_user, id_status_application, date_of_creation } = req.body;

    try {
        const employeeExists = await Employee.findByPk(report_card_number);
        const userExists = await User.findByPk(id_user);
        const statusExists = await StatusApplication.findByPk(id_status_application);

        if (!employeeExists || !userExists || !statusExists) {
            return res.status(404).json({ message: 'Ошибка: Невалидные данные для заявки' });
        }

        const newApplication = await Application.create({
            report_card_number,
            id_user,
            id_status_application,
            date_of_creation
        });

        res.status(201).json(newApplication);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании заявки: ' + err.message });
    }
};

const updateApplication = async (req, res) => {
    const { id } = req.params;
    const { report_card_number, id_user, id_status_application, date_of_creation } = req.body;

    try {
        const application = await Application.findOne({ where: { id_application: id } });

        if (!application) {
            return res.status(404).json({ message: 'Заявка с таким ID не найдена' });
        }

        application.report_card_number = report_card_number || application.report_card_number;
        application.id_user = id_user || application.id_user;
        application.id_status_application = id_status_application || application.id_status_application;
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

module.exports = {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
};