const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth.routes');

const app = express();

connectDB();

// 中间件
app.use(cors());
app.use(express.json());  // 解析JSON请求体

// 路由
app.use('/api/auth', authRoutes);  // 所有认证相关路由

// 测试路由
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '智能书签后端服务运行中',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '路由不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`环境：${process.env.NODE_ENV}`);
  console.log(`健康检查：http://localhost:${PORT}/api/health`);
  console.log(`注册接口：POST http://localhost:${PORT}/api/auth/register`);
});