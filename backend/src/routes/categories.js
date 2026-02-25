import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE category_id = ?').get(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { category_name, sort_order } = req.body;
    const category_id = uuidv4();
    db.prepare('INSERT INTO categories (category_id, category_name, sort_order) VALUES (?, ?, ?)').run(category_id, category_name, sort_order || 0);
    res.json({ category_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { category_name, sort_order } = req.body;
    db.prepare('UPDATE categories SET category_name = ?, sort_order = ?, updated_at = datetime(\'now\') WHERE category_id = ?').run(category_name, sort_order, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE category_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
