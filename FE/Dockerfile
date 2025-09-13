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

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install serve (for static hosting)
RUN npm install -g serve

# Copy dist build from builder
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Configurable port with default 8080
ENV PORT=8080
EXPOSE ${PORT}

# Use shell form to allow environment variable expansion
CMD serve -s dist -l $PORT
