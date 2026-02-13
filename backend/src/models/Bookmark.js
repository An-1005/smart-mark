const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  // 关联用户：这个书签属于哪个用户
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',        // 关联 User 模型
    required: [true, '用户ID不能为空']
  },

  // 书签基础信息
  url: {
    type: String,
    required: [true, '网址不能为空'],
    trim: true
  },
  title: {
    type: String,
    required: [true, '标题不能为空'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },

  // 分类和标签
  category: {
    type: String,
    default: '默认'
  },
  tags: [{
    type: String,
    trim: true
  }],

  // 自动抓取的内容（后续爬虫功能）
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

  // 访问统计
  visitCount: {
    type: Number,
    default: 0
  },
  lastVisited: {
    type: Date,
    default: null
  },

  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间自动更新
bookmarkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 创建复合索引：同一个用户不能收藏重复的网址
bookmarkSchema.index({ userId: 1, url: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;