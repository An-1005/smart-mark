const express = require('express');
const router = express.Router();  // 创建路由对象

// 模拟数据库（数组，暂时替代真实数据库）
let fakeUsersDatabase = [];

// 用户注册接口
router.post('/register', async (req, res) => {
  try {
    // 1. 从请求体中获取数据
    const { username, email, password } = req.body;

    console.log('注册请求数据（模拟模式）:', { username, email });

    // 2. 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '请填写所有字段'
      });
    }

    // 3. 检查用户是否已存在
    const existingUser = fakeUsersDatabase.find(
      user => user.email === email || user.username === username
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 4. 创建模拟用户
    const mockUser = {
      id: Date.now().toString(),  // 用时间戳模拟ID
      username,
      email,
      password: '***已加密***',  // 模拟加密密码
      createdAt: new Date().toISOString()
    };

    // 5. 保存到模拟数据库
    fakeUsersDatabase.push(mockUser);

    // 6. 返回成功响应
    res.status(201).json({
      success: true,
      message: '注册成功（模拟模式）',
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        createdAt: mockUser.createdAt
      },
      note: '当前为模拟模式，用户数据未保存到真实数据库'
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
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

// 导出路由对象
module.exports = router;