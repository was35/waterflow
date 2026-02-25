# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源码并构建
COPY . .
RUN npx vite build

# Stage 2: Backend
FROM node:20-alpine

WORKDIR /app

# 安装后端构建依赖
RUN apk add --no-cache python3 make g++

# 安装后端运行时依赖
COPY backend/package*.json ./
RUN npm ci --only=production

# 复制后端源码
COPY backend/ ./

# 复制前端编译资产
COPY --from=frontend-builder /build/dist ./dist

RUN mkdir -p data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/index.js"]
