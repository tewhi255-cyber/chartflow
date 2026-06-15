FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

RUN npm install --ignore-scripts --no-audit --no-fund && \
    cd backend && npm install --ignore-scripts --no-audit --no-fund && \
    cd ../frontend && npm install --ignore-scripts --no-audit --no-fund

COPY . .

RUN cd backend && npm run build && \
    cd ../frontend && npx vite build && \
    mkdir -p ../backend/public && \
    cp -r dist/* ../backend/public/ && \
    cd .. && rm -rf frontend node_modules

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["node", "backend/dist/server.js"]
