const StatusApplication = require('../models/StatusApplication');

const getStatusApplications = async (req, res) => {
    try {
        const statuses = await StatusApplication.findAll();
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении статусов заявок: ' + err.message });
    }
};

const getStatusApplicationById = async (req, res) => {
    const { id } = req.params;
    try {
        const status = await StatusApplication.findOne({
            where: { id_status_application: id }
        });
        if (!status) {
            return res.status(404).json({ message: 'Статус заявки с таким ID не найден' });
        }
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении статуса заявки: ' + err.message });
    }
};

const createStatusApplication = async (req, res) => {
    const { status_application_name, description } = req.body;
    try {
        if (!status_application_name) {
            return res.status(400).json({ message: 'Статус заявки обязателен' });
        }

        const newStatus = await StatusApplication.create({
            status_application_name,
            description
        });

        res.status(201).json(newStatus);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании статуса заявки: ' + err.message });
    }
};

const updateStatusApplication = async (req, res) => {
    const { id } = req.params;
    const { status_application_name, description } = req.body;

    try {
        const status = await StatusApplication.findOne({
            where: { id_status_application: id }
        });

        if (!status) {
            return res.status(404).json({ message: 'Статус заявки с таким ID не найден' });
        }

        status.status_application_name = status_application_name || status.status_application_name;
        status.description = description || status.description;

        await status.save();

        res.json(status);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении статуса заявки: ' + err.message });
    }
};

const deleteStatusApplication = async (req, res) => {
    const { id } = req.params;
    try {
        const status = await StatusApplication.findOne({
            where: { id_status_application: id }
        });

        if (!status) {
            return res.status(404).json({ message: 'Статус заявки с таким ID не найден' });
        }

        await status.destroy();

        res.status(204).json({ message: 'Статус заявки удален' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении статуса заявки: ' + err.message });
    }
};

module.exports = {
    getStatusApplications,
    getStatusApplicationById,
    createStatusApplication,
    updateStatusApplication,
    deleteStatusApplication
};