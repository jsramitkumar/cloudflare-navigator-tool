
# Stage 1: Build the React frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Build the Express backend
FROM node:20-alpine as backend-builder

WORKDIR /app/server

# Copy backend package files for better layer caching
COPY src/server/package.json src/server/package-lock.json ./
RUN npm ci

# Copy the backend code
COPY src/server ./

# Stage 3: Production environment
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Install serve for frontend static serving
RUN npm install -g serve

WORKDIR /app

# Create directory structure
RUN mkdir -p /app/dist /app/server

# Copy built frontend from the builder stage
COPY --from=frontend-builder /app/dist /app/dist

# Copy the backend from the builder stage
COPY --from=backend-builder /app/server /app/server

# Install production dependencies for the backend
WORKDIR /app/server
RUN npm ci --production

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Expose ports for both frontend and backend
EXPOSE 8080 3001

# Add start script
COPY --from=frontend-builder /app/docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

WORKDIR /app
CMD ["/app/docker-entrypoint.sh"]
