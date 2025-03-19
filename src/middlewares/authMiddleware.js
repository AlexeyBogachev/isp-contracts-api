const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwtConfig');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Неверный токен' });
    }
};

module.exports = authMiddleware;