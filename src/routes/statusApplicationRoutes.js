const express = require('express');
const statusApplicationController = require('../controllers/statusApplicationController');

const router = express.Router();

router.get('/', statusApplicationController.getStatusApplications);
router.get('/:id', statusApplicationController.getStatusApplicationById);
router.post('/', statusApplicationController.createStatusApplication);
router.put('/:id', statusApplicationController.updateStatusApplication);
router.delete('/:id', statusApplicationController.deleteStatusApplication);

module.exports = router;