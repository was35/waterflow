import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/waterflow.db');

import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    category_id TEXT PRIMARY KEY,
    category_name TEXT UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS data_sources (
    source_id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_type TEXT DEFAULT 'manual',
    relevance_score REAL DEFAULT 50,
    discovery_method TEXT,
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_rules (
    rule_id TEXT PRIMARY KEY,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    rule_content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'viewer',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS articles (
    article_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category_id TEXT,
    source TEXT,
    source_url TEXT,
    author TEXT,
    publish_time TEXT,
    summary TEXT,
    image_url TEXT,
    ai_score REAL DEFAULT 0,
    ai_category TEXT,
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    api_key_id TEXT PRIMARY KEY,
    api_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    permissions TEXT,
    rate_limit INTEGER DEFAULT 100,
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS api_logs (
    log_id TEXT PRIMARY KEY,
    api_key_id TEXT,
    endpoint TEXT,
    method TEXT,
    params TEXT,
    result TEXT,
    status INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_filter_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_data TEXT NOT NULL,
    filter_rule_id TEXT,
    filter_result TEXT,
    relevance_score REAL DEFAULT 0,
    category TEXT,
    summary TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    processed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (filter_rule_id) REFERENCES ai_rules(rule_id)
  );

  CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    search_type TEXT DEFAULT 'water_news',
    results_count INTEGER DEFAULT 0,
    articles_json TEXT,
    status TEXT DEFAULT 'success',
    error_message TEXT,
    executed_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS search_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text TEXT NOT NULL,
    query_type TEXT DEFAULT 'ai_search',
    daily_limit INTEGER DEFAULT 50,
    used_count INTEGER DEFAULT 0,
    last_used_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const defaultAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!defaultAdmin) {
  db.prepare(`INSERT INTO users (user_id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)`).run(
    'admin-001',
    'admin',
    'admin123',
    'admin@waterflow.com',
    'admin'
  );
}

const defaultSettings = db.prepare('SELECT * FROM settings WHERE key = ?').get('update_time');
if (!defaultSettings) {
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).run('update_time', '02:00');
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).run('openai_api_key', '');
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).run('openai_base_url', 'https://api.openai.com/v1');
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).run('openai_model', 'gpt-4o-mini');
}

const defaultCategories = db.prepare('SELECT * FROM categories').all();
if (defaultCategories.length === 0) {
  const categories = [
    { id: 'cat-001', name: '水务政策', order: 1 },
    { id: 'cat-002', name: '技术创新', order: 2 },
    { id: 'cat-003', name: '市场动态', order: 3 },
    { id: 'cat-004', name: '案例研究', order: 4 },
  ];
  const insert = db.prepare('INSERT INTO categories (category_id, category_name, sort_order) VALUES (?, ?, ?)');
  categories.forEach(c => insert.run(c.id, c.name, c.order));
}

export default db;
