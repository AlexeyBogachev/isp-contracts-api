const Tariff = require('../models/Tariff');
const StatusTariff = require('../models/StatusTariff');

const getTariffs = async (req, res) => {
    try {
        const tariffs = await Tariff.findAll({
            include: [{ model: StatusTariff, attributes: ['id_status_tariff', 'tariff_status_name'] }],
        });
        res.json(tariffs);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const getTariffById = async (req, res) => {
    const { id } = req.params;
    try {
        const tariff = await Tariff.findOne({
            where: { id_tariff: id },
            include: [{ model: StatusTariff, attributes: ['id_status_tariff', 'tariff_status_name'] }],
        });
        if (!tariff) {
            return res.status(404).json({ message: 'Тариф с таким ID не найден' });
        }
        res.json(tariff);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const createTariff = async (req, res) => {
    const { id_status_tariff, tariff_name, speed_mbps, price, description } = req.body;
    
    try {
        const statusExists = await StatusTariff.findByPk(id_status_tariff);
        if (!statusExists) {
            return res.status(404).json({ message: 'Статус тарифа с таким ID не существует' });
        }

        const newTariff = await Tariff.create({
            id_status_tariff,
            tariff_name,
            speed_mbps,
            price,
            description,
        });
        res.status(201).json(newTariff);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании тарифа: ' + err.message });
    }
};

const updateTariff = async (req, res) => {
    const { id } = req.params;
    const { id_status_tariff, tariff_name, speed_mbps, price, description } = req.body;

    try {
        const tariff = await Tariff.findOne({ where: { id_tariff: id } });
        if (!tariff) {
            return res.status(404).json({ message: 'Тариф с таким ID не найден' });
        }

        tariff.id_status_tariff = id_status_tariff || tariff.id_status_tariff;
        tariff.tariff_name = tariff_name || tariff.tariff_name;
        tariff.speed_mbps = speed_mbps || tariff.speed_mbps;
        tariff.price = price || tariff.price;
        tariff.description = description || tariff.description;

        await tariff.save();
        res.json(tariff);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении тарифа: ' + err.message });
    }
};

const deleteTariff = async (req, res) => {
    const { id } = req.params;
    try {
        const tariff = await Tariff.findOne({ where: { id_tariff: id } });
        if (!tariff) {
            return res.status(404).json({ message: 'Тариф с таким ID не найден' });
        }
        await tariff.destroy();
        res.status(204).json({ message: 'Тариф удален' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении тарифа: ' + err.message });
    }
};

module.exports = {
    getTariffs,
    getTariffById,
    createTariff,
    updateTariff,
    deleteTariff
};