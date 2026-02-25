FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./

RUN npm ci --only=production

COPY backend/ ./

RUN mkdir -p data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/index.js"]
