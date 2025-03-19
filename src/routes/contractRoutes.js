const express = require('express');
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, contractController.getContracts);
router.get('/:id', authMiddleware, contractController.getContractById);
router.post('/', authMiddleware, contractController.createContract);
router.put('/:id', authMiddleware, contractController.updateContract);
router.delete('/:id', authMiddleware, contractController.deleteContract);

module.exports = router;