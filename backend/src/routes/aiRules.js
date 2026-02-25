import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const rules = db.prepare('SELECT * FROM ai_rules ORDER BY created_at DESC').all();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const rule = db.prepare('SELECT * FROM ai_rules WHERE rule_id = ?').get(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { rule_name, rule_type, rule_content } = req.body;
    const rule_id = uuidv4();
    db.prepare('INSERT INTO ai_rules (rule_id, rule_name, rule_type, rule_content) VALUES (?, ?, ?, ?)').run(rule_id, rule_name, rule_type, JSON.stringify(rule_content));
    res.json({ rule_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { rule_name, rule_type, rule_content } = req.body;
    db.prepare('UPDATE ai_rules SET rule_name = ?, rule_type = ?, rule_content = ? WHERE rule_id = ?').run(rule_name, rule_type, JSON.stringify(rule_content), req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM ai_rules WHERE rule_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
