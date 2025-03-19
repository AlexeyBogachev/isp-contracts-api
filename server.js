require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const sequelize = require('./src/config/database');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);

const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('База данных подключена');
    
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (err) {
    console.error('Ошибка подключения к БД:', err.message);
  }
};

startServer();