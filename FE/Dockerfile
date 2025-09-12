# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci

# Copy all files
COPY . .

# Build the Vite app
RUN npm run build

# --- Runtime Stage ---
FROM node:18-alpine

WORKDIR /app

# Install serve (for static hosting)
RUN npm install -g serve

# Copy dist build from builder
COPY --from=builder /app/dist ./dist

# Configurable port with default 8080
ENV PORT=8080

EXPOSE ${PORT}

# Use JSON CMD (recommended)
CMD ["serve", "-s", "dist", "-l", "${PORT}"]
