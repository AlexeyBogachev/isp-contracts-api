require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'supersecretkey',
    expiresIn: '2h',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    },
};