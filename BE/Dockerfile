# --- Base Image ---
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy rest of the backend code
COPY . .

# Create directory for SSL certificates
RUN mkdir -p /app/ssl

# Default port is 3001 but configurable
ENV PORT=3001

# SSL/TLS Configuration (optional)
ENV SSL_ENABLED=false
ENV SSL_CERT_PATH=/app/ssl/cert.pem
ENV SSL_KEY_PATH=/app/ssl/key.pem
ENV SSL_PORT=3443

# Expose both HTTP and HTTPS ports
EXPOSE ${PORT}
EXPOSE ${SSL_PORT}

# Create volume mount point for SSL certificates
VOLUME ["/app/ssl"]

# Start backend (switch npm run dev to npm start in production if possible)
CMD ["npm", "run", "dev"]
