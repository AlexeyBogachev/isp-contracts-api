const express = require('express');
const router = express.Router();
const statusApplicationController = require('../controllers/statusApplicationController');

router.get('/', statusApplicationController.getStatusApplications);
router.get('/:id', statusApplicationController.getStatusApplicationById);
router.post('/', statusApplicationController.createStatusApplication);
router.put('/:id', statusApplicationController.updateStatusApplication);
router.delete('/:id', statusApplicationController.deleteStatusApplication);

module.exports = router;