# --- Base Image ---
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy rest of the backend code
COPY . .

# Default port is 3001 but configurable
ENV PORT=3001

# Expose port (for documentation only)
EXPOSE ${PORT}

# Start backend (switch npm run dev to npm start in production if possible)
CMD ["npm", "run", "dev"]
