import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const keys = db.prepare('SELECT * FROM api_keys ORDER BY created_at DESC').all();
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, permissions, rate_limit } = req.body;
    const api_key_id = uuidv4();
    const api_key = 'wf_' + crypto.randomBytes(16).toString('hex');
    db.prepare('INSERT INTO api_keys (api_key_id, api_key, name, permissions, rate_limit) VALUES (?, ?, ?, ?, ?)').run(api_key_id, api_key, name, JSON.stringify(permissions || []), rate_limit || 100);
    res.json({ api_key_id, api_key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, permissions, rate_limit, enabled } = req.body;
    db.prepare('UPDATE api_keys SET name = ?, permissions = ?, rate_limit = ?, enabled = ? WHERE api_key_id = ?').run(name, JSON.stringify(permissions), rate_limit, enabled, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM api_keys WHERE api_key_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM api_logs ORDER BY created_at DESC LIMIT 100').all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
