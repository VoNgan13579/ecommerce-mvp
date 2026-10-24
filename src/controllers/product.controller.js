const prisma = require('../configs/prisma');

// 1. Lấy danh sách sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json({
      status: 'success',
      data: products
    });
  } catch (error) {
    console.error("Error getAllProducts:", error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 2. Tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const { pname, price, quantity } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        pname,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 0
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Product created successfully!',
      data: newProduct
    });
  } catch (error) {
    console.error("Error createProduct:", error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  createProduct
};