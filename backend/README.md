# WaterFlow AI 后端服务

一个轻量级的AI驱动数据处理和搜索后端服务，基于Node.js + Express + SQLite构建。

## 技术栈

- **后端框架**: Node.js + Express
- **数据库**: SQLite (better-sqlite3)
- **AI集成**: OpenAI API
- **定时任务**: node-cron
- **容器化**: Docker + Docker Compose

## 快速开始

### 1. 环境配置

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，设置必要的配置：
```bash
# OpenAI API 配置 (必需)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# 服务配置
PORT=3000
UPDATE_TIME=02:00

# 管理员账户
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 2. 使用 Docker Compose 部署

```bash
docker-compose up -d
```

服务将在 `http://localhost:3000` 启动。

### 3. 本地开发

后端服务：
```bash
cd backend
npm install
npm run dev
```

前端服务：
```bash
npm install
npm run dev
```

## API 接口文档

### 认证

所有API接口都需要使用API密钥进行认证：

```bash
# 请求头中添加
x-api-key: your-api-key

# 或者在查询参数中添加
?api_key=your-api-key
```

### 核心功能API

#### 1. AI筛选模块

**批量数据筛选**
```http
POST /api/ai-filter/filter
Content-Type: application/json
x-api-key: your-api-key

{
  "data_items": [
    {
      "id": "1",
      "title": "水务公司推出智慧水表",
      "content": "某水务公司推出新型智慧水表..."
    }
  ],
  "filter_rule": "筛选与水务行业相关的数据"
}
```

**单条数据分析**
```http
POST /api/ai-filter/analyze
Content-Type: application/json
x-api-key: your-api-key

{
  "data_item": {
    "title": "智慧水务发展报告",
    "content": "智慧水务是未来发展趋势..."
  }
}
```

**批量筛选（大批量）**
```http
POST /api/ai-filter/batch-filter
Content-Type: application/json
x-api-key: your-api-key

{
  "data_items": [/* 最多500条数据 */],
  "filter_rule": "水务行业相关数据"
}
```

**获取筛选结果**
```http
GET /api/ai-filter/results?limit=50&offset=0
x-api-key: your-api-key
```

#### 2. AI搜索模块

**关键词搜索**
```http
GET /api/ai-search/search?keyword=智慧水务&max_count=20
x-api-key: your-api-key
```

**批量抓取**
```http
POST /api/ai-search/fetch
Content-Type: application/json
x-api-key: your-api-key

{
  "max_count": 50
}
```

**搜索统计**
```http
GET /api/ai-search/stats
x-api-key: your-api-key
```

**搜索历史**
```http
GET /api/ai-search/history?limit=20&offset=0&status=success
x-api-key: your-api-key
```

#### 3. 数据源管理

**获取数据源列表**
```http
GET /api/data-sources?enabled=1
x-api-key: your-api-key
```

**创建数据源**
```http
POST /api/data-sources
Content-Type: application/json
x-api-key: your-api-key

{
  "source_name": "水务新闻网",
  "source_url": "https://example.com",
  "source_type": "manual",
  "relevance_score": 85
}
```

**更新数据源**
```http
PUT /api/data-sources/{id}
Content-Type: application/json
x-api-key: your-api-key

{
  "source_name": "更新后的名称",
  "enabled": 1
}
```

**删除数据源**
```http
DELETE /api/data-sources/{id}
x-api-key: your-api-key
```

#### 4. AI规则管理

**获取AI规则**
```http
GET /api/ai-rules
x-api-key: your-api-key
```

**创建AI规则**
```http
POST /api/ai-rules
Content-Type: application/json
x-api-key: your-api-key

{
  "rule_name": "水务数据筛选",
  "rule_type": "filter",
  "rule_content": "筛选与水务行业相关的数据"
}
```

#### 5. 文章管理

**获取文章列表**
```http
GET /api/articles?category_id=cat-001&page=1&limit=20
x-api-key: your-api-key
```

**获取文章详情**
```http
GET /api/articles/{id}
x-api-key: your-api-key
```

**创建文章**
```http
POST /api/articles
Content-Type: application/json
x-api-key: your-api-key

{
  "title": "智慧水务发展趋势",
  "content": "智慧水务是未来发展方向...",
  "category_id": "cat-001",
  "ai_score": 85
}
```

#### 6. 系统管理

**健康检查**
```http
GET /api/health
```

**获取设置**
```http
GET /api/settings
x-api-key: your-api-key
```

**更新设置**
```http
PUT /api/settings/{key}
Content-Type: application/json
x-api-key: your-api-key

{
  "value": "新的设置值"
}
```

## 功能特性

### AI筛选功能
- ✅ 批量数据筛选
- ✅ 单条数据分析
- ✅ 自定义筛选规则
- ✅ 结果持久化存储
- ✅ 失败重试机制
- ✅ 错误处理

### AI搜索功能
- ✅ 关键词搜索
- ✅ 批量数据抓取
- ✅ 每日限额控制（50条）
- ✅ 搜索历史记录
- ✅ 搜索统计
- ✅ 失败重试机制

### 数据管理
- ✅ 数据源CRUD操作
- ✅ 文章管理
- ✅ 分类管理
- ✅ AI规则管理
- ✅ API密钥管理

### 系统功能
- ✅ 定时任务（每日抓取）
- ✅ API认证和授权
- ✅ 速率限制
- ✅ 错误处理
- ✅ 日志记录
- ✅ Docker容器化

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

## 部署说明

### Docker部署

1. 构建镜像：
```bash
docker build -t waterflow-backend .
```

2. 运行容器：
```bash
docker run -d -p 3000:3000 --env-file .env waterflow-backend
```

### Docker Compose部署

```bash
docker-compose up -d
```

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| OPENAI_API_KEY | OpenAI API密钥 | 必需 |
| OPENAI_BASE_URL | OpenAI API基础URL | https://api.openai.com/v1 |
| OPENAI_MODEL | 使用的AI模型 | gpt-4o-mini |
| PORT | 服务端口 | 3000 |
| UPDATE_TIME | 定时任务时间 | 02:00 |
| ADMIN_USERNAME | 管理员用户名 | admin |
| ADMIN_PASSWORD | 管理员密码 | admin123 |

## 开发指南

### 数据库结构

主要数据表：
- `data_sources`: 数据源表
- `articles`: 文章表
- `categories`: 分类表
- `ai_rules`: AI规则表
- `ai_filter_results`: AI筛选结果表
- `search_history`: 搜索历史表
- `api_keys`: API密钥表
- `users`: 用户表

### 扩展开发

1. **添加新的AI功能**：在 `services/` 目录下创建新的服务文件
2. **添加新的API路由**：在 `routes/` 目录下创建新的路由文件
3. **添加新的中间件**：在 `middleware/` 目录下创建新的中间件文件

### 测试

运行测试：
```bash
npm test
```

## 许可证

MIT License