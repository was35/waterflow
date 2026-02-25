import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';

const router = express.Router();
import express from 'express';

router.get('/', (req, res) => {
  try {
    const { page = 1, pageSize = 10, category, keyword, timeRange, source, aiScoreMin, aiScoreMax, sortBy } = req.query;
    
    let sql = 'SELECT a.*, c.category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.category_id WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND a.category_id = ?';
      params.push(category);
    }
    if (keyword) {
      sql += ' AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (timeRange) {
      const now = new Date();
      let startDate = '';
      if (timeRange === 'day') startDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      else if (timeRange === 'week') startDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      else if (timeRange === 'month') startDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      if (startDate) {
        sql += ' AND a.publish_time >= ?';
        params.push(startDate);
      }
    }
    if (source) {
      sql += ' AND a.source = ?';
      params.push(source);
    }
    if (aiScoreMin) {
      sql += ' AND a.ai_score >= ?';
      params.push(parseFloat(aiScoreMin));
    }
    if (aiScoreMax) {
      sql += ' AND a.ai_score <= ?';
      params.push(parseFloat(aiScoreMax));
    }

    if (sortBy === 'time-asc') sql += ' ORDER BY a.publish_time ASC';
    else if (sortBy === 'views-desc') sql += ' ORDER BY a.views DESC';
    else sql += ' ORDER BY a.publish_time DESC';

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const articles = db.prepare(sql).all(...params);
    const countSql = sql.replace(/SELECT a\.\*.*FROM articles a.*WHERE 1=1/, 'SELECT COUNT(*) as total FROM articles a WHERE 1=1').split('LIMIT')[0];
    const total = db.prepare(countSql).get(...params.slice(0, -2)).total;

    res.json({ data: articles, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const article = db.prepare('SELECT a.*, c.category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.category_id WHERE a.article_id = ?').get(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    db.prepare('UPDATE articles SET views = views + 1 WHERE article_id = ?').run(req.params.id);
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, content, category_id, source, source_url, author, publish_time, summary, image_url } = req.body;
    const article_id = uuidv4();
    db.prepare(`INSERT INTO articles (article_id, title, content, category_id, source, source_url, author, publish_time, summary, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(article_id, title, content, category_id, source, source_url, author, publish_time, summary, image_url);
    res.json({ article_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { title, content, category_id, source, source_url, author, publish_time, summary, image_url, ai_score, ai_category } = req.body;
    db.prepare(`UPDATE articles SET title = ?, content = ?, category_id = ?, source = ?, source_url = ?, author = ?, publish_time = ?, summary = ?, image_url = ?, ai_score = ?, ai_category = ?, updated_at = datetime('now') WHERE article_id = ?`).run(title, content, category_id, source, source_url, author, publish_time, summary, image_url, ai_score, ai_category, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM articles WHERE article_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
