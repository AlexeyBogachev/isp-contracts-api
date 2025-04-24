const sequelize = require('../config/database');
const Contract = require('../models/Contract');
const Employee = require('../models/Employee');
const Application = require('../models/Application');
const StatusContract = require('../models/StatusContract');
const Tariff = require('../models/Tariff');

const getContracts = async (req, res) => {
    try {
        const contracts = await Contract.findAll({
            include: [
                {
                    model: Employee,
                    attributes: ['surname', 'name', 'patronymic']
                },
                {
                    model: Application,
                    attributes: ['date_of_creation', 'id_user'],
                    include: [
                        {
                            model: Tariff,
                            attributes: ['tariff_name', 'speed_mbps']
                        }
                    ]
                },
                {
                    model: StatusContract,
                    attributes: ['status_contract_name']
                }
            ],
            attributes: [
                'id_contract', 'face_account', 'total_cost',
                'date_of_conclusion', 'date_of_termination',
                'contract_terms'
            ]
        });

        const userIds = contracts.map(contract => contract.application.id_user);
        
        const usersData = await sequelize.query(
            `SELECT 
                u.id_user, u.phone_number, u.email,
                np.surname, np.name, np.patronymic, np.date_of_birth, np.gender,
                np.registration_address, np.residential_address,
                np.passport_number, np.passport_series,
                le.name AS company_name, le.tin, le.registration_number, 
                le.director_full_name, le.contact_person, le.contact_phone, 
                le.actual_address, le.website
            FROM decrypted_users u
            LEFT JOIN decrypted_natural_persons np ON u.id_user = np.id_user
            LEFT JOIN legal_entity le ON u.id_user = le.id_user
            WHERE u.id_user IN (:userIds)`,
            { replacements: { userIds }, type: sequelize.QueryTypes.SELECT }
        );
        
        const usersMap = {};
        usersData.forEach(user => {
            let userType = "Неизвестно";
            let userDetails = {};
            
            if (user.surname) {
                userType = "Физическое лицо";
                userDetails = {
                    surname: user.surname,
                    name: user.name,
                    patronymic: user.patronymic,
                    date_of_birth: user.date_of_birth,
                    gender: user.gender,
                    registration_address: user.registration_address,
                    residential_address: user.residential_address,
                    passport_number: user.passport_number,
                    passport_series: user.passport_series
                };
            }
            
            if (user.company_name) {
                userType = "Юридическое лицо";
                userDetails = {
                    company_name: user.company_name,
                    tin: user.tin,
                    registration_number: user.registration_number,
                    director_full_name: user.director_full_name,
                    contact_person: user.contact_person,
                    contact_phone: user.contact_phone,
                    actual_address: user.actual_address,
                    website: user.website
                };
            }

            usersMap[user.id_user] = {
                phone_number: user.phone_number,
                email: user.email,
                user_type: userType,
                ...userDetails
            };
        });

        contracts.forEach(contract => {
            contract.application.dataValues.user = usersMap[contract.application.id_user] || null;
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
    const {
        id_status_contract,
        report_card_number,
        id_application,
        face_account,
        total_cost,
        date_of_conclusion,
        date_of_termination,
        reason_for_termination_of_agreement,
        contract_terms
    } = req.body;

    try {
        if (!id_status_contract || !report_card_number || !id_application || !face_account || !total_cost || !date_of_conclusion) {
            return res.status(400).json({ message: 'Отсутствуют обязательные поля' });
        }

        const employeeExists = await Employee.findByPk(report_card_number);
        const applicationExists = await Application.findByPk(id_application);
        const statusExists = await StatusContract.findByPk(id_status_contract);

        if (!employeeExists || !applicationExists || !statusExists) {
            return res.status(404).json({ message: 'Ошибка: Невалидные данные для контракта' });
        }

        const newContract = await Contract.create({
            id_status_contract,
            report_card_number,
            id_application,
            face_account,
            total_cost,
            date_of_conclusion,
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
    const {
        id_status_contract,
        report_card_number,
        id_application,
        face_account,
        total_cost,
        date_of_conclusion,
        date_of_termination,
        reason_for_termination_of_agreement,
        contract_terms
    } = req.body;

    try {
        const contract = await Contract.findOne({ where: { id_contract: id } });

        if (!contract) {
            return res.status(404).json({ message: 'Контракт с таким ID не найден' });
        }

        contract.id_status_contract = id_status_contract || contract.id_status_contract;
        contract.report_card_number = report_card_number || contract.report_card_number;
        contract.id_application = id_application || contract.id_application;
        contract.face_account = face_account || contract.face_account;
        contract.total_cost = total_cost || contract.total_cost;
        contract.date_of_conclusion = date_of_conclusion || contract.date_of_conclusion;
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