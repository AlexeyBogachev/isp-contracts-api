const express = require('express');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, applicationController.getApplications);
router.get('/:id', authMiddleware, applicationController.getApplicationById);
router.post('/', authMiddleware, applicationController.createApplication);
router.put('/:id', authMiddleware, applicationController.updateApplication);
router.delete('/:id', authMiddleware, applicationController.deleteApplication);

module.exports = router;