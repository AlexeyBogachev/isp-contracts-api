const express = require('express');
const legalEntityController = require('../controllers/legalEntityController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, legalEntityController.getLegalEntities);
router.get('/:id', authMiddleware, legalEntityController.getLegalEntityByUserId);
router.post('/', authMiddleware, legalEntityController.createLegalEntity);
router.put('/:id', authMiddleware, legalEntityController.updateLegalEntity);
router.delete('/:id', authMiddleware, legalEntityController.deleteLegalEntity);

module.exports = router;