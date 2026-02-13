const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const express = require('express');
const User = require('../models/User');
const router = express.Router();  // 创建路由对象

// 用户注册接口（真实数据库版）
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('注册请求数据:', { username, email });

    // 1. 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写所有字段'
      });
    }

    // 2. 检查用户是否已存在（查真实数据库）
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 3. 创建新用户（保存到真实数据库）
    const user = new User({
      username,
      email,
      password
    });

    await user.save();  // ✅ 这里会真正存到 MongoDB

    // 4. 返回成功响应
    res.status(201).json({
      success: true,
      message: '注册成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
      console.error('========== 注册错误详细日志 ==========');
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      console.error('完整错误:', error);
      console.error('=====================================');

      res.status(500).json({
        success: false,
        message: '注册失败',
        error: error.message  // 开发环境直接返回错误信息
      });
    }
});
// 用户登录接口（真实数据库版）
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    console.log('登录请求:', { email, username });

    // 1. 验证必填字段
    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入邮箱/用户名和密码'
      });
    }

    // 2. 查找用户（查真实数据库）
    const user = await User.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 3. 验证密码（使用bcrypt比较）
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

// 5. 处理"记住我"
    const rememberMe = req.body.rememberMe === true;
    const expiresIn = rememberMe ? 604800 : 3600;
   // 生成真正的 JWT Token
   const token = jwt.sign(
     {
       userId: user._id,
       email: user.email
     },
     process.env.JWT_SECRET,
     { expiresIn: rememberMe ? '7d' : '1d' }
   );

    // 6. 返回成功响应
    res.json({
      success: true,
      message: '登录成功',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      expiresIn
    });

  } catch (error) {
      console.error('========== 登录错误详细日志 ==========');
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      console.error('完整错误:', error);
      console.error('=====================================');

      res.status(500).json({
        success: false,
        message: '登录失败，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
});

// 测试路由
router.get('/test', (req, res) => {
  res.json({
    message: '认证路由工作正常',
    userCount: fakeUsersDatabase.length,
    users: fakeUsersDatabase
  });
});

// 测试受保护的路由——需要登录才能访问
router.get('/me', authMiddleware, (req, res) => {
  // authMiddleware 已经把用户信息挂到 req.user 上了
  res.json({
    success: true,
    message: '获取当前用户信息成功',
    user: req.user
  });
});

// 导出路由对象
module.exports = router;