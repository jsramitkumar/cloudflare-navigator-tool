
# Use Node.js as the base image
FROM node:20-alpine

# Set environment variables with defaults
ENV NODE_ENV=production
ENV PORT=3001
ENV API_URL=https://api.cloudflare.com/client/v4

WORKDIR /app

# Create directory structure
RUN mkdir -p /app/server

# Copy the backend files
COPY src/server /app/server

# Install production dependencies for the backend
WORKDIR /app/server
RUN npm ci --production

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/api/cloudflare/test-connection || exit 1

# Expose backend port
EXPOSE $PORT

# Add start script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

WORKDIR /app
CMD ["/app/docker-entrypoint.sh"]
