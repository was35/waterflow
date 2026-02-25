import db from '../database.js';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟
const RATE_LIMIT_MAX_REQUESTS = 60; // 每分钟最多60个请求

const requestCounts = new Map();

export function rateLimitMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const clientId = apiKey || req.ip;
  
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, []);
  }
  
  const requests = requestCounts.get(clientId);
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: '请求过于频繁，请稍后再试',
      retry_after: Math.ceil((validRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
    });
  }
  
  validRequests.push(now);
  requestCounts.set(clientId, validRequests);
  
  next();
}

export function apiKeyAuthMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ error: '需要提供API密钥' });
  }
  
  try {
    const keyInfo = db.prepare(`
      SELECT * FROM api_keys 
      WHERE api_key = ? AND enabled = 1
    `).get(apiKey);
    
    if (!keyInfo) {
      return res.status(401).json({ error: '无效的API密钥' });
    }
    
    req.apiKeyInfo = keyInfo;
    
    db.prepare(`
      INSERT INTO api_logs (api_key_id, endpoint, method, params, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(keyInfo.api_key_id, req.path, req.method, JSON.stringify(req.query), 200);
    
    next();
  } catch (error) {
    console.error('API密钥验证失败:', error);
    res.status(500).json({ error: 'API密钥验证失败' });
  }
}

export function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '需要提供管理员令牌' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE user_id = ? AND role = 'admin'
    `).get(token);
    
    if (!user) {
      return res.status(403).json({ error: '需要管理员权限' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('管理员验证失败:', error);
    res.status(500).json({ error: '管理员验证失败' });
  }
}

export function basicAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: '需要提供基本认证' });
  }
  
  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  
  try {
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE username = ? AND password_hash = ?
    `).get(username, password);
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('基本认证失败:', error);
    res.status(500).json({ error: '认证失败' });
  }
}
