import express from 'express';
import db from '../database.js';

const router = express.Router();

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = db.prepare('SELECT user_id, username, email, role FROM users WHERE username = ? AND password_hash = ?').get(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    const [type, credentials] = authHeader.split(' ');
    if (type !== 'Basic') {
      return res.status(401).json({ error: 'Invalid authorization type' });
    }
    const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
    const user = db.prepare('SELECT user_id, username, email, role FROM users WHERE username = ? AND password_hash = ?').get(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
