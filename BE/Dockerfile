FROM node:18-alpine

WORKDIR /app
COPY BE/package*.json ./
RUN npm install

COPY BE/ ./
COPY server/ ./

EXPOSE 3001
CMD ["npm", "start"]