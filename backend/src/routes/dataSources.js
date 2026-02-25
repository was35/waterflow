import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { enabled } = req.query;
    let sql = 'SELECT * FROM data_sources WHERE 1=1';
    if (enabled !== undefined) sql += ' AND enabled = ?';
    sql += ' ORDER BY created_at DESC';
    const sources = enabled !== undefined ? db.prepare(sql).all(parseInt(enabled)) : db.prepare(sql).all();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const source = db.prepare('SELECT * FROM data_sources WHERE source_id = ?').get(req.params.id);
    if (!source) return res.status(404).json({ error: 'Data source not found' });
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { source_name, source_url, source_type, relevance_score, discovery_method } = req.body;
    const source_id = uuidv4();
    db.prepare('INSERT INTO data_sources (source_id, source_name, source_url, source_type, relevance_score, discovery_method) VALUES (?, ?, ?, ?, ?, ?)').run(source_id, source_name, source_url, source_type || 'manual', relevance_score || 50, discovery_method);
    res.json({ source_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { source_name, source_url, source_type, relevance_score, discovery_method, enabled } = req.body;
    db.prepare('UPDATE data_sources SET source_name = ?, source_url = ?, source_type = ?, relevance_score = ?, discovery_method = ?, enabled = ?, updated_at = datetime(\'now\') WHERE source_id = ?').run(source_name, source_url, source_type, relevance_score, discovery_method, enabled, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM data_sources WHERE source_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
