# --- Build Stage ---
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Build the Vite app
RUN npm run build

# --- Runtime Stage ---
FROM node:18-alpine

WORKDIR /app

# Install a simple static server (or you can use Nginx if preferred)
RUN npm install -g serve

# Copy build output from builder
COPY --from=builder /app/dist ./dist

# Configurable port with default 8080
ENV PORT=8080

# Expose the port (just for documentation, container can still bind)
EXPOSE ${PORT}

# Use shell form so ENV substitution works
CMD serve -s dist -l ${PORT}
