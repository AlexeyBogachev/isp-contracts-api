const User = require('../models/User');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        const usersWithDecryptedData = [];

        for (let user of users) {
            const [decryptedUser] = await sequelize.query(
                `SELECT * FROM decrypted_users WHERE id_user = :id_user`,
                { replacements: { id_user: user.id_user }, type: sequelize.QueryTypes.SELECT }
            );

            const userData = {
                id_user: user.id_user,
                phone_number: decryptedUser ? decryptedUser.phone_number : user.phone_number,
                email: decryptedUser ? decryptedUser.email : user.email,
                password: user.password
            };

            usersWithDecryptedData.push(userData);
        }

        res.json(usersWithDecryptedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при получении пользователей: ' + err.message });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ where: { id_user: id } });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении пользователя: ' + err.message });
    }
};

const createUser = async (req, res) => {
    const { phone_number, email, password } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({ phone_number, email, password: hashedPassword });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при создании пользователя: ' + err.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { phone_number, email, password } = req.body;
    try {
        const user = await User.findOne({ where: { id_user: id } });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        if (password) user.password = await hashPassword(password);
        user.phone_number = phone_number || user.phone_number;
        user.email = email || user.email;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при обновлении пользователя: ' + err.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ where: { id_user: id } });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        await user.destroy();
        res.status(204).json({ message: 'Пользователь удалён' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при удалении пользователя: ' + err.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};