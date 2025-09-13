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

# Install serve (for static hosting) - globally for all users
RUN npm install -g serve

# Create SSL directory with proper permissions
RUN mkdir -p /app/ssl && \
    chown -R nextjs:nodejs /app/ssl

# Copy dist build from builder
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Configurable port with default 8080
ENV PORT=8080

# SSL/TLS Configuration (optional)
ENV SSL_ENABLED=false
ENV SSL_CERT_PATH=/app/ssl/cert.pem
ENV SSL_KEY_PATH=/app/ssl/key.pem
ENV SSL_PORT=8443

# Expose both HTTP and HTTPS ports
EXPOSE ${PORT}
EXPOSE ${SSL_PORT}

# Create volume mount point for SSL certificates
VOLUME ["/app/ssl"]

# Create startup script that handles SSL logic
COPY --chown=nextjs:nodejs <<'EOF' /app/start.sh
#!/bin/sh

if [ "$SSL_ENABLED" = "true" ]; then
  # Check if SSL certificates exist
  if [ -f "$SSL_CERT_PATH" ] && [ -f "$SSL_KEY_PATH" ]; then
    echo "Starting HTTPS server on port $SSL_PORT and HTTP server on port $PORT"
    
    # Start HTTP server in background
    serve -s dist -l $PORT &
    
    # Start HTTPS server in foreground
    serve -s dist -l $SSL_PORT --ssl-cert "$SSL_CERT_PATH" --ssl-key "$SSL_KEY_PATH"
  else
    echo "SSL enabled but certificates not found. Starting HTTP only on port $PORT"
    serve -s dist -l $PORT
  fi
else
  echo "Starting HTTP server on port $PORT"
  serve -s dist -l $PORT
fi
EOF

# Make the script executable
RUN chmod +x /app/start.sh

# Use the startup script
CMD ["/app/start.sh"]
