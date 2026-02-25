import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:key', (req, res) => {
  try {
    const setting = db.prepare('SELECT * FROM settings WHERE key = ?').get(req.params.key);
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:key', (req, res) => {
  try {
    const { value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))').run(req.params.key, value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
