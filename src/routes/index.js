const express = require('express');
const router = express.Router();
const eventsRoutes = require('./events.routes');
const userRoutes = require('./user.routes')
const { verifyJWT } = require('../middleware/jwt_verify')

router.use('/events', verifyJWT, eventsRoutes);
router.use('/user', userRoutes)

module.exports = router;
