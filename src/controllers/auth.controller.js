const prisma = require('../configs/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Khóa bí mật JWT (có thể đưa vào .env sau)
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_ecommerce';

// 1. Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới theo yêu cầu: role 'normal', score 10
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role: 'normal',
        score: 10
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully!',
      data: {
        id: newUser.uid,
        username: newUser.username,
        role: newUser.role,
        score: newUser.score
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Đăng nhập nhận Token
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user trong DB
    const user = await prisma.user.findFirst({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found!' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: 'Invalid password!' });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { uid: user.uid, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful!',
      token: token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  register,
  login
};