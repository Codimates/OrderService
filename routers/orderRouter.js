const express = require('express');
const router = express.Router();
const cors = require('cors');

// Updated CORS configuration
router.use(
    cors({
        credentials: true,
        origin: (origin, callback) => {
            const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    })
);

const { createOrder, getOrdersispayedfalse, getUserUnpaidOrders, updateOrder, getOrdersispayedtrue, getOverallTotalPrice, getUserpaidOrders } = require('../controllers/orderController')

router.post('/createorder', createOrder)
router.get('/getordersispayedfalse', getOrdersispayedfalse)

router.get('/user/:userId/unpaid',getUserUnpaidOrders);
router.get('/user/:userId/paid',getUserpaidOrders);
router.put('/update/:orderId',updateOrder);

router.get('/getordersispayedtrue', getOrdersispayedtrue);
router.get('/gettotal', getOverallTotalPrice)

module.exports = router;