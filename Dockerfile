FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./
RUN mkdir -p public && cp -r /app/dist/* public/

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "app.js"]