const Contract = require('../models/Contract');
const Employee = require('../models/Employee');
const Application = require('../models/Application');
const StatusContract = require('../models/StatusContract');
const Tariff = require('../models/Tariff');

const getContracts = async (req, res) => {
    try {
        const contracts = await Contract.findAll({
            include: [
                { model: Employee, attributes: ['surname', 'name'] },
                { model: Application, attributes: ['date_of_creation'] },
                { model: StatusContract, attributes: ['status_contract_name'] },
                { model: Tariff, attributes: ['tariff_name'] },
            ],
        });
        res.json(contracts);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const getContractById = async (req, res) => {
    const { id } = req.params;
    try {
        const contract = await Contract.findOne({
            where: { id_contract: id },
            include: [
                { model: Employee, attributes: ['surname', 'name'] },
                { model: Application, attributes: ['date_of_creation'] },
                { model: StatusContract, attributes: ['status_contract_name'] },
                { model: Tariff, attributes: ['tariff_name'] },
            ],
        });

        if (!contract) {
            return res.status(404).json({ message: 'Контракт с таким ID не найден' });
        }

        res.json(contract);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const createContract = async (req, res) => {
    const { id_status_contract, report_card_number, id_application, id_tariff, face_account, total_cost, data_limit, date_of_conclusion, ip_address, date_of_termination, reason_for_termination_of_agreement, contract_terms } = req.body;

    try {
        const employeeExists = await Employee.findByPk(report_card_number);
        const applicationExists = await Application.findByPk(id_application);
        const tariffExists = await Tariff.findByPk(id_tariff);
        const statusExists = await StatusContract.findByPk(id_status_contract);

        if (!employeeExists || !applicationExists || !tariffExists || !statusExists) {
            return res.status(404).json({ message: 'Ошибка: Невалидные данные для контракта' });
        }

        const newContract = await Contract.create({
            id_status_contract,
            report_card_number,
            id_application,
            id_tariff,
            face_account,
            total_cost,
            data_limit,
            date_of_conclusion,
            ip_address,
            date_of_termination,
            reason_for_termination_of_agreement,
            contract_terms
        });

        res.status(201).json(newContract);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании контракта: ' + err.message });
    }
};

const updateContract = async (req, res) => {
    const { id } = req.params;
    const { id_status_contract, report_card_number, id_application, id_tariff, face_account, total_cost, data_limit, date_of_conclusion, ip_address, date_of_termination, reason_for_termination_of_agreement, contract_terms } = req.body;

    try {
        const contract = await Contract.findOne({ where: { id_contract: id } });

        if (!contract) {
            return res.status(404).json({ message: 'Контракт с таким ID не найден' });
        }

        contract.id_status_contract = id_status_contract || contract.id_status_contract;
        contract.report_card_number = report_card_number || contract.report_card_number;
        contract.id_application = id_application || contract.id_application;
        contract.id_tariff = id_tariff || contract.id_tariff;
        contract.face_account = face_account || contract.face_account;
        contract.total_cost = total_cost || contract.total_cost;
        contract.data_limit = data_limit || contract.data_limit;
        contract.date_of_conclusion = date_of_conclusion || contract.date_of_conclusion;
        contract.ip_address = ip_address || contract.ip_address;
        contract.date_of_termination = date_of_termination || contract.date_of_termination;
        contract.reason_for_termination_of_agreement = reason_for_termination_of_agreement || contract.reason_for_termination_of_agreement;
        contract.contract_terms = contract_terms || contract.contract_terms;

        await contract.save();
        res.json(contract);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении контракта: ' + err.message });
    }
};

const deleteContract = async (req, res) => {
    const { id } = req.params;
    try {
        const contract = await Contract.findOne({ where: { id_contract: id } });

        if (!contract) {
            return res.status(404).json({ message: 'Контракт с таким ID не найден' });
        }

        await contract.destroy();
        res.status(204).json({ message: 'Контракт удален' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении контракта: ' + err.message });
    }
};

module.exports = {
    getContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract
};