const express = require('express');
const router = express.Router();
const naturalPersonController = require('../controllers/naturalPersonController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, naturalPersonController.getNaturalPersons);
router.get('/:id', authMiddleware, naturalPersonController.getNaturalPersonByUserId);
router.post('/', authMiddleware, naturalPersonController.createNaturalPerson);
router.put('/:id', authMiddleware, naturalPersonController.updateNaturalPerson);
router.delete('/:id', authMiddleware, naturalPersonController.deleteNaturalPerson);

module.exports = router;