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
        const [userByPhone] = await sequelize.query(
            `SELECT * FROM decrypted_users WHERE phone_number = :phone_number`,
            { replacements: { phone_number }, type: sequelize.QueryTypes.SELECT }
        );

        const [employeeByPhone] = await sequelize.query(
            `SELECT * FROM decrypted_employees WHERE phone_number = :phone_number`,
            { replacements: { phone_number }, type: sequelize.QueryTypes.SELECT }
        );

        if (userByPhone || employeeByPhone) {
            return res.status(400).json({ message: 'Пользователь с таким номером телефона уже существует' });
        }

        if (email) {
            const [userByEmail] = await sequelize.query(
                `SELECT * FROM decrypted_users WHERE email = :email`,
                { replacements: { email }, type: sequelize.QueryTypes.SELECT }
            );

            if (userByEmail) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ phone_number, email, password: hashedPassword });

        res.status(201).json({ message: 'Регистрация успешна', userId: newUser.id_user });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка регистрации', message: err.message });
    }
};

const registerEmployee = async (req, res) => {
    const { id_role, phone_number, password, email, surname, name, patronymic, gender, date_of_birth, residential_address, photo, acceptance_date_work, date_of_violation } = req.body;
    try {
        const existingEmployee = await Employee.findOne({ where: { phone_number } });
        const [existingUser] = await sequelize.query(
            `SELECT * FROM decrypted_users WHERE phone_number = :phone_number`,
            { replacements: { phone_number }, type: sequelize.QueryTypes.SELECT }
        );

        if (existingEmployee || existingUser) {
            return res.status(400).json({ message: 'Номер телефона уже используется' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = await Employee.create({
            id_role, phone_number, password: hashedPassword, email, surname, name, patronymic, gender,
            date_of_birth, residential_address, photo, acceptance_date_work, date_of_violation
        });

        res.status(201).json({ message: 'Сотрудник зарегистрирован', employeeId: newEmployee.report_card_number });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка регистрации', message: err.message });
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
        res.cookie('access_token', token, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 });
        res.json({ message: 'Авторизация успешна', token });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка входа', message: err.message });
    }
};

const logout = (req, res) => {
    res.clearCookie('access_token');
    res.json({ message: 'Выход выполнен' });
};

const checkAuth = (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        res.json({
            message: 'Авторизован',
            id: decoded.id,
            role: decoded.role
        });
    } catch (err) {
        res.clearCookie('access_token');
        res.status(401).json({ message: 'Сессия истекла, войдите заново' });
    }
};

module.exports = { registerUser, registerEmployee, login, logout, checkAuth };