import express from 'express';
import db from '../database.js';
import { searchWaterNews, fetchAndSaveArticles } from '../services/aiSearchService.js';

const router = express.Router();

const DAILY_LIMIT = 50;

function getDailyUsageCount() {
  const today = new Date().toISOString().split('T')[0];
  const result = db.prepare(`
    SELECT COALESCE(SUM(results_count), 0) as count 
    FROM search_history 
    WHERE date(executed_at) = date(?)
  `).get(today);
  
  return result?.count || 0;
}

function checkDailyLimit() {
  const dailyCount = getDailyUsageCount();
  if (dailyCount >= DAILY_LIMIT) {
    throw new Error(`每日搜索限额已用完（${DAILY_LIMIT}条），请明天再试`);
  }
  return DAILY_LIMIT - dailyCount;
}

function saveSearchHistory(keyword, searchType, resultsCount, articles, status, errorMessage = null) {
  db.prepare(`
    INSERT INTO search_history (keyword, search_type, results_count, articles_json, status, error_message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(keyword, searchType, resultsCount, JSON.stringify(articles), status, errorMessage);
}

router.get('/search', async (req, res) => {
  try {
    const { keyword, max_count = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: '请提供搜索关键词' });
    }

    const remaining = checkDailyLimit();
    const actualMaxCount = Math.min(parseInt(max_count), remaining, 50);

    console.log(`开始AI搜索: ${keyword}, 剩余限额: ${remaining}`);

    const articles = await searchWaterNews(keyword);
    const limitedArticles = articles.slice(0, actualMaxCount);

    saveSearchHistory(
      keyword,
      'water_news',
      limitedArticles.length,
      limitedArticles,
      'success'
    );

    res.json({
      success: true,
      keyword: keyword,
      count: limitedArticles.length,
      remaining: remaining - limitedArticles.length,
      results: limitedArticles
    });
  } catch (error) {
    console.error('AI搜索失败:', error);
    
    if (keyword) {
      saveSearchHistory(keyword, 'water_news', 0, [], 'failed', error.message);
    }
    
    res.status(500).json({ error: error.message });
  }
});

router.post('/fetch', async (req, res) => {
  try {
    const remaining = checkDailyLimit();
    const maxCount = Math.min(req.body.max_count || 50, remaining, 50);

    console.log(`开始AI抓取任务, 最大 ${maxCount} 条`);

    const articles = await fetchAndSaveArticles(maxCount);

    saveSearchHistory(
      '批量抓取',
      'batch_fetch',
      articles.length,
      articles,
      'success'
    );

    res.json({
      success: true,
      count: articles.length,
      remaining: remaining - articles.length,
      results: articles
    });
  } catch (error) {
    console.error('AI抓取失败:', error);
    
    saveSearchHistory('批量抓取', 'batch_fetch', 0, [], 'failed', error.message);
    
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', (req, res) => {
  try {
    const { limit = 20, offset = 0, status } = req.query;
    
    let sql = 'SELECT * FROM search_history WHERE 1=1';
    const params = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY executed_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const history = db.prepare(sql).all(...params);
    const countSql = status 
      ? 'SELECT COUNT(*) as total FROM search_history WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM search_history';
    const countResult = status 
      ? db.prepare(countSql).get(status)
      : db.prepare(countSql).get();
    
    res.json({
      total: countResult.total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      results: history
    });
  } catch (error) {
    console.error('获取搜索历史失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const todayStats = db.prepare(`
      SELECT 
        COUNT(*) as total_searches,
        COALESCE(SUM(results_count), 0) as total_results
      FROM search_history 
      WHERE date(executed_at) = date(?)
    `).get(today);

    const totalStats = db.prepare(`
      SELECT 
        COUNT(*) as total_searches,
        COALESCE(SUM(results_count), 0) as total_results
      FROM search_history
    `).get();

    res.json({
      daily_limit: DAILY_LIMIT,
      daily_used: todayStats?.total_results || 0,
      daily_remaining: DAILY_LIMIT - (todayStats?.total_results || 0),
      total_searches: totalStats?.total_searches || 0,
      total_results: totalStats?.total_results || 0
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
