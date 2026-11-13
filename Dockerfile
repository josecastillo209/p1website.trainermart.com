FROM node:22-bookworm-slim

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./
RUN mkdir -p public && cp -r /app/client/dist/* public/

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "app.js"]