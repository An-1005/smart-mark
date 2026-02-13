const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const authMiddleware = require('../middleware/auth');

/**
 * 所有书签接口都需要登录
 * 所以 authMiddleware 加在所有路由前面
 */
router.use(authMiddleware);

// ------------------- 创建书签 -------------------
router.post('/', async (req, res) => {
  try {
    const { url, title, description, category, tags } = req.body;

    // 验证必填字段
    if (!url || !title) {
      return res.status(400).json({
        success: false,
        message: '网址和标题不能为空'
      });
    }

    // 从 authMiddleware 挂载的 req.user 获取用户ID
    const userId = req.user._id;

    // 检查是否已经收藏过这个网址
    const existing = await Bookmark.findOne({ userId, url });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '您已经收藏过这个网址了'
      });
    }

    // 创建书签
    const bookmark = new Bookmark({
      userId,
      url,
      title,
      description: description || '',
      category: category || '默认',
      tags: tags || []
    });

    await bookmark.save();

    res.status(201).json({
      success: true,
      message: '收藏成功',
      bookmark
    });

  } catch (error) {
    console.error('创建书签错误:', error);
    res.status(500).json({
      success: false,
      message: '创建书签失败',
      error: error.message
    });
  }
});

// ------------------- 获取我的书签列表 -------------------
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    // 支持分页
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 支持搜索
    const search = req.query.search || '';
    const category = req.query.category;

    // 构建查询条件
    let query = { userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    // 执行查询
    const bookmarks = await Bookmark.find(query)
      .sort({ createdAt: -1 })  // 最新的在前面
      .skip(skip)
      .limit(limit);

    const total = await Bookmark.countDocuments(query);

    res.json({
      success: true,
      bookmarks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取书签列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取书签列表失败'
    });
  }
});

// ------------------- 获取单个书签详情 -------------------
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user._id;
    const bookmarkId = req.params.id;

    const bookmark = await Bookmark.findOne({ _id: bookmarkId, userId });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: '书签不存在'
      });
    }

    // 增加访问次数
    bookmark.visitCount += 1;
    bookmark.lastVisited = Date.now();
    await bookmark.save();

    res.json({
      success: true,
      bookmark
    });

  } catch (error) {
    console.error('获取书签详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取书签详情失败'
    });
  }
});

// ------------------- 更新书签 -------------------
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user._id;
    const bookmarkId = req.params.id;
    const { title, description, category, tags } = req.body;

    const bookmark = await Bookmark.findOne({ _id: bookmarkId, userId });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: '书签不存在'
      });
    }

    // 更新字段
    if (title) bookmark.title = title;
    if (description !== undefined) bookmark.description = description;
    if (category) bookmark.category = category;
    if (tags) bookmark.tags = tags;

    await bookmark.save();

    res.json({
      success: true,
      message: '更新成功',
      bookmark
    });

  } catch (error) {
    console.error('更新书签错误:', error);
    res.status(500).json({
      success: false,
      message: '更新书签失败'
    });
  }
});

// ------------------- 删除书签 -------------------
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id;
    const bookmarkId = req.params.id;

    const result = await Bookmark.deleteOne({ _id: bookmarkId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: '书签不存在'
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });

  } catch (error) {
    console.error('删除书签错误:', error);
    res.status(500).json({
      success: false,
      message: '删除书签失败'
    });
  }
});

// ------------------- 获取分类统计 -------------------
router.get('/stats/categories', async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Bookmark.aggregate([
      { $match: { userId: userId } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('获取分类统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类统计失败'
    });
  }
});

module.exports = router;