const express = require('express');
require('dotenv').config();
const prisma = require('./configs/prisma');
const productRoutes = require('./routes/product.route');
const authRoutes = require('./routes/auth.route');
const orderRoutes = require('./routes/order.route');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware cho phép đọc JSON từ Body Request
app.use(express.json());

// 1. Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'success',
      message: 'Server is running and Database is connected successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// 2. Đăng ký các Routes API (Phải đặt TRƯỚC app.listen)
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// 3. Khởi động Server (Phải nằm ở CUỐI CÙNG)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});