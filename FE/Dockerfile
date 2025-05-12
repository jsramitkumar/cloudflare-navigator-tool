# Build stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY FE/package*.json ./
RUN npm ci

# Copy source files and build
COPY FE/ .

# Expose port
EXPOSE 8080

# Start the Node.js server
CMD ["npm", "run", "dev"]
