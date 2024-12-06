const express = require('express');
const router = express.Router();
const cors = require('cors');

// Updated CORS configuration
router.use(
    cors()
);

const { createPaymentIntent } = require('../controllers/striptController')

router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;