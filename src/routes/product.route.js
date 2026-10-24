const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// [GET] /api/products -> Lấy danh sách sản phẩm
router.get('/', productController.getAllProducts);

// [POST] /api/products -> Tạo sản phẩm mới
router.post('/', productController.createProduct);

module.exports = router;