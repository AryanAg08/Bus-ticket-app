# Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# backend 
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install
COPY server/ ./ 
COPY --from=frontend-build /app/client/dist ./public
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "src/index.js"]