
# Stage 1: Build the React frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Set default URLs that can be overridden at build time
ARG API_URL=https://api.cloudflare.com/client/v4
ARG BACKEND_URL=http://localhost:3001
ENV VITE_API_URL=$API_URL
ENV VITE_BACKEND_URL=$BACKEND_URL

# Build the React app with environment variables
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

# Set environment variables with defaults that can be overridden
ENV NODE_ENV=production
ENV PORT=3001
ENV API_URL=https://api.cloudflare.com/client/v4
ENV FRONTEND_URL=http://localhost:8080
ENV BACKEND_URL=http://localhost:3001
ENV FRONTEND_PORT=8080
ENV BACKEND_PORT=3001

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

# Add healthcheck that uses the FRONTEND_PORT env variable
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$FRONTEND_PORT/ || exit 1

# Expose ports for both frontend and backend (dynamic)
EXPOSE $FRONTEND_PORT $PORT

# Add start script
COPY --from=frontend-builder /app/docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

WORKDIR /app
CMD ["/app/docker-entrypoint.sh"]
