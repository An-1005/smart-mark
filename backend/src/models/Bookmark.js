const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: '默认'
  },
  tags: [{
    type: String,
    trim: true
  }],
  content: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  keywords: [{
    type: String
  }],
  visitCount: {
    type: Number,
    default: 0
  },
  lastVisited: {
    type: Date,
    default: null
  }
}, {
  // 自动管理 createdAt 和 updatedAt
  timestamps: true
});

// 复合索引：同一个用户不能收藏重复的网址
bookmarkSchema.index({ userId: 1, url: 1 }, { unique: true });

// ✅ 关键：导出的是模型，不是 schema
module.exports = mongoose.model('Bookmark', bookmarkSchema);