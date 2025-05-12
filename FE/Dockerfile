
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

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY FE/nginx.conf /etc/nginx/conf.d/default.conf.template

# Expose port
EXPOSE 8080

# Set a default backend service URL
ENV BACKEND_SERVICE_URL=http://backend:3001/

# Use envsubst to replace environment variables in nginx config at runtime
CMD ["/bin/sh", "-c", "envsubst '$$BACKEND_SERVICE_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
