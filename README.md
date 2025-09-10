# Cloudflare Navigator

## Project Structure

This project is now organized with separate frontend and backend directories to avoid npm installation conflicts:

```
├── FE/                 # Frontend (React + Vite)
│   ├── package.json    # Frontend dependencies only
│   └── src/           # All React components and assets
├── BE/                 # Backend (Express.js)
│   ├── package.json    # Backend dependencies only
│   └── index.js       # Express server
└── docker-compose.yml  # Docker configuration
```

## Local Development Setup

### Option 1: Using Docker (Recommended)
```bash
docker-compose up --build
```

### Option 2: Manual Setup

1. **Install Backend Dependencies:**
```bash
cd BE
npm install
```

2. **Install Frontend Dependencies:**
```bash
cd FE
npm install
```

3. **Start Backend (in one terminal):**
```bash
cd BE
npm run dev
```

4. **Start Frontend (in another terminal):**
```bash
cd FE
npm run dev
```

## Migration Steps

To migrate your current setup to this new structure:

1. **Move frontend files to FE directory:**
```bash
# Move all source files
mv src/ FE/
mv public/ FE/
mv index.html FE/
mv vite.config.ts FE/
mv tailwind.config.ts FE/
mv eslint.config.js FE/
```

2. **Copy configuration files:**
```bash
# Copy to both FE and root (for compatibility)
cp tsconfig.json FE/
cp tsconfig.node.json FE/
cp postcss.config.js FE/
cp components.json FE/
```

3. **Install dependencies in new structure:**
```bash
cd FE && npm install
cd ../BE && npm install
```

## Environment Variables

Set these environment variables for the backend:
- `PORT` - Backend port (default: 3001)
- `API_URL` - Cloudflare API URL (default: https://api.cloudflare.com/client/v4)

## Docker

The Docker setup automatically handles the separated structure:
- Frontend builds to static files served by nginx on port 8080
- Backend runs Express.js on port 3001