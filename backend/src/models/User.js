const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 定义用户数据结构
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,  // 用户名必须唯一
    trim: true,    // 自动去除空格
    minlength: [3, '用户名至少3个字符'],
    maxlength: [20, '用户名最多20个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    lowercase: true,  // 自动转小写
    match: [/.+@.+\..+/, '请输入有效的邮箱地址']  // 邮箱格式验证
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符']
  },
  createdAt: {
    type: Date,
    default: Date.now  // 自动设置创建时间
  }
});

// 在保存用户前加密密码
userSchema.pre('save', async function(next) {
  // 只有密码被修改时才重新加密
  if (!this.isModified('password')) return next();

  try {
    // 生成盐并加密密码（bcrypt是专门用于密码加密的库）
    const salt = await bcrypt.genSalt(10);  // 生成盐值
    this.password = await bcrypt.hash(this.password, salt);  // 加密密码
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码的方法（登录时使用）
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// 创建用户模型
const User = mongoose.model('User', userSchema);

module.exports = User;