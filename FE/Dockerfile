
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Set default API URL
ENV VITE_API_URL=http://localhost:3001

# Copy package files and install dependencies
COPY FE/package*.json ./
RUN npm ci

# Copy source files and build
COPY FE/ .
RUN npm run build

# Production stage - use Node.js instead of Nginx
FROM node:18-alpine

WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json .

# Install only production dependencies
RUN npm install --production

# Add a simple Express server to serve the static files
COPY FE/server.js .

# Set a default backend service URL
ENV BACKEND_SERVICE_URL=http://backend:3001/

# Expose port
EXPOSE 8080

# Start the Node.js server
CMD ["node", "server.js"]
