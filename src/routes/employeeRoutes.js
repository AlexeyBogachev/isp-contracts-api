const express = require('express');
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, employeeController.getEmployees);
router.get('/:id', authMiddleware, employeeController.getEmployeeById);
router.post('/', authMiddleware, employeeController.createEmployee);
router.put('/:id', authMiddleware, employeeController.updateEmployee);
router.delete('/:id', authMiddleware, employeeController.deleteEmployee);

module.exports = router;