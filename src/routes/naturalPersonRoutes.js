const express = require('express');
const naturalPersonController = require('../controllers/naturalPersonController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, naturalPersonController.getNaturalPersons);
router.get('/:id', authMiddleware, naturalPersonController.getNaturalPersonByUserId);
router.post('/', authMiddleware, naturalPersonController.createNaturalPerson);
router.put('/:id', authMiddleware, naturalPersonController.updateNaturalPerson);
router.delete('/:id', authMiddleware, naturalPersonController.deleteNaturalPerson);

module.exports = router;