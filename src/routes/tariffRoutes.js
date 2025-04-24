const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');

router.get('/', tariffController.getTariffs);
router.get('/:id', tariffController.getTariffById);
router.post('/', tariffController.createTariff);
router.put('/:id', tariffController.updateTariff);
router.delete('/:id', tariffController.deleteTariff);

module.exports = router;