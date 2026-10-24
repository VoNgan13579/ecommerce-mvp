const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Đặt hàng yêu cầu bắt buộc phải qua middleware xác thực token JWT
router.post('/', authMiddleware, orderController.createOrder);

module.exports = router;