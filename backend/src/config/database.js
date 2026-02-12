const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('🔄 正在连接 MongoDB Atlas...');
    console.log('📌 连接字符串（已隐藏密码）:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':***@'));

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB Atlas 连接成功！');
    console.log('📊 数据库:', mongoose.connection.name);
    console.log('🌍 主机:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;