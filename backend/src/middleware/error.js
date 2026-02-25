import express from 'express';
import cors from 'cors';
import db from '../database.js';
import { rateLimitMiddleware, apiKeyAuthMiddleware } from './auth.js';

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: '数据验证失败',
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: '未授权访问',
      details: err.message 
    });
  }
  
  if (err.name === 'RateLimitError') {
    return res.status(429).json({ 
      error: '请求过于频繁',
      retry_after: err.retryAfter 
    });
  }
  
  if (err.name === 'DatabaseError') {
    return res.status(500).json({ 
      error: '数据库操作失败',
      details: process.env.NODE_ENV === 'development' ? err.message : '内部服务器错误'
    });
  }
  
  if (err.name === 'AIServiceError') {
    return res.status(503).json({ 
      error: 'AI服务暂时不可用',
      details: err.message 
    });
  }
  
  res.status(500).json({ 
    error: '内部服务器错误',
    details: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
}

export function createError(name, message, details = null) {
  const error = new Error(message);
  error.name = name;
  if (details) error.details = details;
  return error;
}

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        throw createError('ValidationError', error.details[0].message);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function applyGlobalMiddleware(app) {
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
  
  app.use(rateLimitMiddleware);
  
  app.use((req, res, next) => {
    req.db = db;
    next();
  });
}

export class AIServiceError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'AIServiceError';
    this.details = details;
  }
}

export class DatabaseError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'DatabaseError';
    this.details = details;
  }
}
