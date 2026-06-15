FROM node:20-alpine

RUN adduser -D -u 1000 user
USER user
ENV HOME=/home/user
ENV PATH="$HOME/.local/bin:$PATH"
WORKDIR /app

COPY --chown=user package*.json ./
COPY --chown=user backend/package*.json backend/
COPY --chown=user frontend/package*.json frontend/

RUN cd backend && npm install --ignore-scripts --no-audit --no-fund

COPY --chown=user . .

RUN cd backend && npm run build && cd ../frontend && npx vite build && mkdir -p ../backend/public && cp -r dist/* ../backend/public/

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["node", "backend/dist/server.js"]
