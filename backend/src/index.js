import express from 'express';
import cors from 'cors';
import db from './database.js';
import { applyGlobalMiddleware, errorHandler } from './middleware/error.js';
import { apiKeyAuthMiddleware } from './middleware/auth.js';
import articleRoutes from './routes/articles.js';
import categoryRoutes from './routes/categories.js';
import dataSourceRoutes from './routes/dataSources.js';
import aiRuleRoutes from './routes/aiRules.js';
import aiFilterRoutes from './routes/aiFilter.js';
import aiSearchRoutes from './routes/aiSearch.js';
import userRoutes from './routes/users.js';
import apiManageRoutes from './routes/apiManage.js';
import settingsRoutes from './routes/settings.js';
import authRoutes from './routes/auth.js';
import { startScheduledFetch } from './services/fetchService.js';

const app = express();
const PORT = process.env.PORT || 3000;

applyGlobalMiddleware(app);

app.use('/api/auth', authRoutes);
app.use('/api/articles', apiKeyAuthMiddleware, articleRoutes);
app.use('/api/categories', apiKeyAuthMiddleware, categoryRoutes);
app.use('/api/data-sources', apiKeyAuthMiddleware, dataSourceRoutes);
app.use('/api/ai-rules', apiKeyAuthMiddleware, aiRuleRoutes);
app.use('/api/ai-filter', apiKeyAuthMiddleware, aiFilterRoutes);
app.use('/api/ai-search', apiKeyAuthMiddleware, aiSearchRoutes);
app.use('/api/users', apiKeyAuthMiddleware, userRoutes);
app.use('/api/api-manage', apiKeyAuthMiddleware, apiManageRoutes);
app.use('/api/settings', apiKeyAuthMiddleware, settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.listen(PORT, () => {
  console.log(`🚀 WaterFlow API server running on port ${PORT}`);
  startScheduledFetch();
});
