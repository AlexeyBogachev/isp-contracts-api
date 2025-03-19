const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sequelize = require('../../config/database');
const User = require('../../models/User');
const Employee = require('../../models/Employee');
const { secret, expiresIn, cookieOptions } = require('../../config/jwtConfig');

const generateToken = (user, role) => {
    return jwt.sign(
        { id: user.id_user || user.report_card_number, role },
        secret,
        { expiresIn }
    );
};

const registerUser = async (req, res) => {
    const { phone_number, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ where: { phone_number } });
        if (existingUser) return res.status(400).json({ message: 'Пользователь уже существует' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ phone_number, email, password: hashedPassword });

        res.status(201).json({ message: 'Регистрация успешна', userId: newUser.id_user });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка регистрации: ' + err.message });
    }
};

const registerEmployee = async (req, res) => {
    const { id_role, phone_number, password, email, surname, name, patronymic, gender, date_of_birth, residential_address, photo, acceptance_date_work, date_of_violation } = req.body;
    try {
        const existingEmployee = await Employee.findOne({ where: { phone_number } });
        if (existingEmployee) return res.status(400).json({ message: 'Сотрудник уже зарегистрирован' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = await Employee.create({
            id_role, phone_number, password: hashedPassword, email, surname, name, patronymic, gender,
            date_of_birth, residential_address, photo, acceptance_date_work, date_of_violation
        });

        res.status(201).json({ message: 'Сотрудник зарегистрирован', employeeId: newEmployee.report_card_number });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка регистрации: ' + err.message });
    }
};

const login = async (req, res) => {
    const { phone_number, password } = req.body;
    try {
        const [user] = await sequelize.query(
            `SELECT * FROM decrypted_users WHERE phone_number = :phone_number`,
            { replacements: { phone_number }, type: sequelize.QueryTypes.SELECT }
        );
        
        const [employee] = await sequelize.query(
            `SELECT * FROM decrypted_employees WHERE phone_number = :phone_number`,
            { replacements: { phone_number }, type: sequelize.QueryTypes.SELECT }
        );

        const account = user || employee;
        if (!account) {
            return res.status(400).json({ message: 'Неверные учетные данные' });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверные учетные данные' });
        }

        const token = generateToken(account, user ? 'user' : 'employee');
        res.cookie('access_token', token, { ...cookieOptions, maxAge: 3600000 });
        res.json({ message: 'Авторизация успешна', token });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка входа: ' + err.message });
    }
};

const logout = (req, res) => {
    res.clearCookie('access_token');
    res.json({ message: 'Выход выполнен' });
};

module.exports = { registerUser, registerEmployee, login, logout };