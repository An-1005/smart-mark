const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 身份验证中间件
 * 作用：检查请求头里的 token，解析出用户信息，挂到 req.user 上
 * 如果 token 无效或过期，返回 401
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. 从请求头获取 token
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 2. token 格式通常是 "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '令牌格式错误'
      });
    }

    // 3. 验证 token 是否有效
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. 根据 token 里的 userId 查找用户
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 5. 把用户信息挂到 req 对象上，后续接口可以直接使用
    req.user = user;
    req.token = token;

    // 6. 放行，进入真正的接口处理函数
    next();

  } catch (error) {
    // token 过期或签名错误
    console.error('认证失败:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期，请重新登录'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌'
      });
    }

    res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};

module.exports = authMiddleware;