# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY FE/package*.json ./
RUN npm ci

# Copy source files and build
COPY FE/ .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve for production static file serving
RUN npm install -g serve

# Copy build output from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Start the static file server
CMD ["serve", "-s", "dist", "-l", "8080"]
