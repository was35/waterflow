import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const users = db.prepare('SELECT user_id, username, email, role, created_at, updated_at FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT user_id, username, email, role, created_at, updated_at FROM users WHERE user_id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const user_id = uuidv4();
    db.prepare('INSERT INTO users (user_id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)').run(user_id, username, password, email, role || 'viewer');
    res.json({ user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    if (password) {
      db.prepare('UPDATE users SET username = ?, password_hash = ?, email = ?, role = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(username, password, email, role, req.params.id);
    } else {
      db.prepare('UPDATE users SET username = ?, email = ?, role = ?, updated_at = datetime(\'now\') WHERE user_id = ?').run(username, email, role, req.params.id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE user_id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
