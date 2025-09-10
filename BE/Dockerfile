# Multi-stage build for optimized backend
FROM node:18-alpine AS base

# Add build metadata
LABEL maintainer="cloudflare-navigator"
LABEL description="Backend API server"

# Install dumb-init and security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy package files first for better layer caching
COPY BE/package*.json ./

# Development dependencies stage
FROM base AS dependencies
RUN npm ci --include=dev --no-audit --no-fund

# Production dependencies stage
FROM base AS production-deps
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Build/Production stage
FROM base AS production

# Copy production dependencies
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs BE/ ./
COPY --chown=nodejs:nodejs server/ ./

# Switch to non-root user
USER nodejs

EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/cloudflare/test-connection', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init for proper signal handling and start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]