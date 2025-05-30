const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const naturalPersonRoutes = require('./naturalPersonRoutes');
const legalEntityRoutes = require('./legalEntityRoutes');
const tariffRoutes = require('./tariffRoutes');
const employeeRoutes = require('./employeeRoutes');
const applicationRoutes = require('./applicationRoutes');
const contractRoutes = require('./contractRoutes');
const authRoutes = require('./authorization_routes/authRoutes');
const statusApplicationRoutes = require('./statusApplicationRoutes');
const statusContractRoutes = require('./statusContractRoutes');

router.use('/users', userRoutes);
router.use('/natural-persons', naturalPersonRoutes);
router.use('/legal-entities', legalEntityRoutes);
router.use('/tariffs', tariffRoutes);
router.use('/employees', employeeRoutes);
router.use('/applications', applicationRoutes);
router.use('/contracts', contractRoutes);
router.use('/auth', authRoutes);
router.use('/status-applications', statusApplicationRoutes);
router.use('/status-contracts', statusContractRoutes);

module.exports = router;