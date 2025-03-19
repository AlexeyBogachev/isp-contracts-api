const Employee = require('../models/Employee');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: [{
                model: Role,
                attributes: ['role_name'],
            }]
        });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await Employee.findOne({
            where: { report_card_number: id },
            include: [{
                model: Role,
                attributes: ['role_name'],
            }]
        });

        if (!employee) {
            return res.status(404).json({ message: 'Сотрудник с таким ID не найден' });
        }
        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении данных: ' + err.message });
    }
};

const createEmployee = async (req, res) => {
    const { id_role, phone_number, password, email, surname, name, patronymic, gender, date_of_birth, residential_address, photo, acceptance_date_work, date_of_violation } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const newEmployee = await Employee.create({
            id_role, phone_number, password: hashedPassword, email, surname, name, patronymic, gender, date_of_birth,
            residential_address, photo, acceptance_date_work, date_of_violation
        });
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании сотрудника: ' + err.message });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { id_role, phone_number, password, email, surname, name, patronymic, gender, date_of_birth, residential_address, photo, acceptance_date_work, date_of_violation } = req.body;
    try {
        const employee = await Employee.findOne({ where: { report_card_number: id } });
        if (!employee) {
            return res.status(404).json({ message: 'Сотрудник не найден' });
        }
        if (password) employee.password = await hashPassword(password);
        employee.id_role = id_role || employee.id_role;
        employee.phone_number = phone_number || employee.phone_number;
        employee.email = email || employee.email;
        employee.surname = surname || employee.surname;
        employee.name = name || employee.name;
        employee.patronymic = patronymic || employee.patronymic;
        employee.gender = gender || employee.gender;
        employee.date_of_birth = date_of_birth || employee.date_of_birth;
        employee.residential_address = residential_address || employee.residential_address;
        employee.photo = photo || employee.photo;
        employee.acceptance_date_work = acceptance_date_work || employee.acceptance_date_work;
        employee.date_of_violation = date_of_violation || employee.date_of_violation;
        await employee.save();
        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении сотрудника: ' + err.message });
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await Employee.findOne({ where: { report_card_number: id } });

        if (!employee) {
            return res.status(404).json({ message: 'Сотрудник с таким ID не найден' });
        }

        await employee.destroy();
        res.status(204).json({ message: 'Сотрудник удален' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении сотрудника: ' + err.message });
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};