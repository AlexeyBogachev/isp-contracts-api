const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, applicationController.getApplications);
router.get('/:id', authMiddleware, applicationController.getApplicationById);
router.post('/', authMiddleware, applicationController.createApplication);
router.put('/:id', authMiddleware, applicationController.updateApplication);
router.delete('/:id', authMiddleware, applicationController.deleteApplication);
router.get('/active/:id_user', applicationController.hasActiveApplication);

module.exports = router;