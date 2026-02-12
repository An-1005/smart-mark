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
router.post('/login', async (req, res) => {
  try {
    // 1. 获取请求数据（支持邮箱或用户名登录）
    const { email, username, password } = req.body;

    console.log('登录请求:', { email, username });

    // 2. 数据验证：必须提供邮箱或用户名 + 密码
    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入邮箱/用户名和密码'
      });
    }

    // 3. 查找用户（支持邮箱或用户名查找）
    const user = fakeUsersDatabase.find(u =>
      (email && u.email === email) ||
      (username && u.username === username)
    );

    // 4. 检查用户是否存在
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 5. 验证密码（模拟验证）
    // 真实项目：await bcrypt.compare(password, user.password)
    // 这里简单模拟：密码必须是"123456"
    if (password !== '123456') {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    // 6. 登录成功，生成模拟token
    const mockToken = `mock_token_${Date.now()}_${user.id}`;

    // 7. 处理"记住我"选项
    const rememberMe = req.body.rememberMe === true;
    const expiresIn = rememberMe ? 604800 : 3600; // 7天或1小时

    // 8. 返回成功响应
    res.json({
      success: true,
      message: '登录成功',
      token: mockToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      expiresIn: expiresIn,
      note: '当前为模拟模式，真实项目需使用JWT'
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
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