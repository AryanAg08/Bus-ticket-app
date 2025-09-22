# Build the frontend application
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/. ./
RUN npm run build

#Build the backend application
FROM node:18-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --only=production
COPY server/. ./
COPY --from=frontend-build /app/client/dist ./public
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "src/index.js"]