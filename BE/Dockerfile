# Backend Dockerfile (./BE/Dockerfile)
FROM node:18-alpine AS backend

WORKDIR /app

COPY BE/package*.json ./
RUN npm ci

COPY BE/ .

EXPOSE 3001
CMD ["npm", "start"]