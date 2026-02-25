# WaterFlow AI 后端服务测试指南

## 测试环境准备

### 1. 启动后端服务
```bash
cd backend
npm install
npm start
```

服务将在 `http://localhost:3000` 启动。

### 2. 创建测试API密钥
```bash
sqlite3 backend/data/waterflow.db "INSERT INTO api_keys (api_key_id, api_key, name, permissions) VALUES ('test-key-001', 'test-api-key-123', '测试密钥', 'read,write');"
```

## 功能测试

### 1. 健康检查
```bash
curl http://localhost:3000/api/health
```

预期响应：
```json
{"status":"ok","timestamp":"2026-02-24T16:06:19.580Z"}
```

### 2. API认证测试
**无认证请求：**
```bash
curl http://localhost:3000/api/articles
```
预期响应：
```json
{"error":"需要提供API密钥"}
```

**有认证请求：**
```bash
curl -H "x-api-key: test-api-key-123" http://localhost:3000/api/articles
```
预期响应：
```json
{"data":[],"total":0,"page":1,"pageSize":10}
```

### 3. AI搜索统计测试
```bash
curl -H "x-api-key: test-api-key-123" http://localhost:3000/api/ai-search/stats
```
预期响应：
```json
{"daily_limit":50,"daily_used":0,"daily_remaining":50,"total_searches":0,"total_results":0}
```

### 4. AI筛选测试（需要OpenAI API密钥）
```bash
curl -H "x-api-key: test-api-key-123" -H "Content-Type: application/json" \
  -X POST -d '{"data_item":{"title":"智慧水务发展趋势","content":"智慧水务是未来发展方向，通过AI技术提升水务管理效率"}}' \
  http://localhost:3000/api/ai-filter/analyze
```

如果未配置OpenAI API密钥：
```json
{"error":"未配置 OpenAI API Key"}
```

如果配置了OpenAI API密钥：
```json
{
  "success": true,
  "result": {
    "is_relevant": true,
    "relevance_score": 85,
    "category": "技术创新",
    "summary": "智慧水务通过AI技术提升管理效率",
    "key_points": ["AI技术应用", "水务管理优化"]
  }
}
```

### 5. 数据源管理测试
**获取数据源列表：**
```bash
curl -H "x-api-key: test-api-key-123" http://localhost:3000/api/data-sources
```

**创建数据源：**
```bash
curl -H "x-api-key: test-api-key-123" -H "Content-Type: application/json" \
  -X POST -d '{"source_name":"水务新闻网","source_url":"https://example.com","source_type":"manual","relevance_score":85}' \
  http://localhost:3000/api/data-sources
```

**更新数据源：**
```bash
curl -H "x-api-key: test-api-key-123" -H "Content-Type: application/json" \
  -X PUT -d '{"source_name":"更新后的名称","enabled":1}' \
  http://localhost:3000/api/data-sources/{id}
```

### 6. 速率限制测试
快速连续发送多个请求：
```bash
for i in {1..70}; do
  curl -H "x-api-key: test-api-key-123" http://localhost:3000/api/articles
done
```

预期在某个时刻会收到：
```json
{"error":"请求过于频繁，请稍后再试","retry_after":30}
```

## 性能测试

### 1. 批量AI筛选性能
```bash
curl -H "x-api-key: test-api-key-123" -H "Content-Type: application/json" \
  -X POST -d '{"data_items":[{"id":"1","title":"测试1"},{"id":"2","title":"测试2"},...{"id":"100","title":"测试100"}]}' \
  http://localhost:3000/api/ai-filter/batch-filter
```

### 2. 数据库查询性能
```bash
# 测试大量数据查询
curl -H "x-api-key: test-api-key-123" "http://localhost:3000/api/articles?limit=1000"
```

## 错误处理测试

### 1. 无效API密钥
```bash
curl -H "x-api-key: invalid-key" http://localhost:3000/api/articles
```
预期响应：
```json
{"error":"无效的API密钥"}
```

### 2. 请求参数错误
```bash
curl -H "x-api-key: test-api-key-123" -H "Content-Type: application/json" \
  -X POST -d '{"invalid_field":"test"}' \
  http://localhost:3000/api/data-sources
```

### 3. 资源不存在
```bash
curl -H "x-api-key: test-api-key-123" http://localhost:3000/api/articles/non-existent-id
```

## Docker部署测试

### 1. 构建Docker镜像
```bash
docker build -t waterflow-backend .
```

### 2. 运行容器
```bash
docker run -d -p 3000:3000 --env-file .env waterflow-backend
```

### 3. 使用Docker Compose
```bash
docker-compose up -d
```

### 4. 容器健康检查
```bash
docker ps
docker logs waterflow-backend
```

## 集成测试

### 1. 前端集成测试
在前端项目中测试API调用：
```javascript
import { aiSearch, aiFilter, dataSources } from './services/api';

// 测试AI搜索
aiSearch.getStats().then(console.log).catch(console.error);

// 测试数据源管理
dataSources.getDataSources().then(console.log).catch(console.error);

// 测试AI筛选
aiFilter.analyzeData({title: "测试数据"}).then(console.log).catch(console.error);
```

### 2. 定时任务测试
检查定时任务是否正常执行：
```bash
# 查看日志
tail -f backend/data/waterflow.log
```

## 性能基准

- **API响应时间**: < 500ms (简单查询)
- **AI处理时间**: < 5s (单条数据)
- **批量处理**: 10条/秒 (AI筛选)
- **数据库查询**: < 100ms (1000条数据)
- **内存使用**: < 200MB
- **CPU使用**: < 50% (正常负载)

## 测试报告

所有测试通过后，系统应该：
- ✅ 正常启动和运行
- ✅ API认证正常工作
- ✅ 数据库操作正常
- ✅ 错误处理正确
- ✅ 速率限制有效
- ✅ Docker容器化成功
- ✅ 前端API集成正常

## 故障排除

### 常见问题

1. **数据库锁定错误**
   - 检查是否有其他进程占用数据库
   - 重启服务

2. **OpenAI API错误**
   - 检查API密钥是否正确
   - 检查网络连接
   - 查看API配额

3. **Docker构建失败**
   - 检查Docker daemon是否运行
   - 清理Docker缓存
   - 检查依赖包

4. **端口冲突**
   - 检查3000端口是否被占用
   - 修改PORT环境变量

## 测试完成

完成所有测试后，系统即可投入生产使用。建议：
- 配置监控和日志收集
- 设置定期备份
- 配置SSL证书
- 设置防火墙规则