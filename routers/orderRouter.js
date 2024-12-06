const express = require('express');
const router = express.Router();
const cors = require('cors');

// Updated CORS configuration
router.use(
    cors()
);

const { createOrder, getOrdersispayedfalse, getUserUnpaidOrders, updateOrder, getOrdersispayedtrue, getOverallTotalPrice } = require('../controllers/orderController')

router.post('/createorder', createOrder)
router.get('/getordersispayedfalse', getOrdersispayedfalse)

router.get('/user/:userId/unpaid',getUserUnpaidOrders);
router.put('/update/:orderId',updateOrder);

router.get('/getordersispayedtrue', getOrdersispayedtrue);
router.get('/gettotal', getOverallTotalPrice)

module.exports = router;