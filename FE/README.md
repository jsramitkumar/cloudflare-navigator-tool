
# Cloudflare Navigator

## Overview

Cloudflare Navigator is a powerful web application that allows you to manage your Cloudflare DNS records, tunnels, and account settings with ease. Built with React, TypeScript, and modern web technologies, this tool provides a seamless interface for Cloudflare users.

## Features

- **Multi-Account Management**: Add, edit, and switch between multiple Cloudflare accounts
- **DNS Record Management**: 
  - List, create, edit, and delete DNS records
  - Easy-to-use form for DNS record configuration
- **Cloudflare Tunnel Configuration**:
  - View and manage Cloudflare tunnels
  - Configure tunnel ingress settings
- **Secure Credential Storage**: 
  - Local storage of Cloudflare API credentials
  - Test and validate credentials before saving
- **Configurable Backend URL**: 
  - Set custom backend API URL from the settings page
  - Test connection to ensure backend is reachable

## Prerequisites

- Node.js (version 20 or higher)
- npm or Bun
- Docker (for containerized deployment)
- Docker Compose (for multi-container deployment)
- A Cloudflare account with API access

## ⚠️ IMPORTANT: Required Project Files

This project requires the following files that must be created in the root directory:

1. **package.json** - Root package.json file to manage project dependencies and scripts
2. **index.html** - Root HTML template file
3. **vite.config.ts** - Vite configuration file for the project

**Note:** These files cannot be created by AI. You must create them manually.

### Required package.json content (create in root directory)
```json
{
  "name": "cloudflare-navigator",
  "version": "1.0.0",
  "description": "Cloudflare Navigator Tool",
  "scripts": {
    "install:frontend": "cd FE && npm install",
    "install:backend": "cd BE && npm install",
    "install:all": "npm run install:frontend && npm run install:backend",
    "start": "cd FE && npm run dev",
    "start:server": "cd BE && npm start",
    "build": "cd FE && npm run build",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  },
  "keywords": ["cloudflare", "dns", "tunnels"],
  "author": "",
  "license": "MIT"
}
```

### Required index.html content (create in root directory)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/FE/index.html">
  <title>Cloudflare Navigator</title>
</head>
<body>
  <p>Redirecting to application...</p>
</body>
</html>
```

### Required vite.config.ts content (create in root directory)
```typescript
import { defineConfig } from 'vite';
import path from 'path';

// This is a minimal config that redirects to the actual FE folder
export default defineConfig({
  root: 'FE',
  server: {
    port: 8080
  }
});
```

## Network Requirements

### Internet Connectivity
- Stable broadband internet connection
- Minimum bandwidth: 1 Mbps recommended
- Outbound HTTPS access (Port 443) to:
  - API endpoint configured in deployment
  - `api.cloudflare.com`

### Firewall and Security
- Ensure your network allows outbound HTTPS connections
- Whitelist domains if using strict network policies

## Docker Deployment Options

This application can be deployed in several ways using Docker:

### 1. Separated Frontend and Backend Deployment

Deploy frontend and backend separately, ideal for distributed architectures:

#### Frontend Deployment
```bash
# Build the frontend image
docker build -t cloudflare-navigator-frontend:latest -f FE/Dockerfile .

# Run the frontend container
docker run -d -p 8080:8080 -e BACKEND_SERVICE_URL=http://your-backend-url:3001/ cloudflare-navigator-frontend:latest
```

#### Backend Deployment
```bash
# Build the backend image
docker build -t cloudflare-navigator-backend:latest -f BE/Dockerfile .

# Run the backend container
docker run -d -p 3001:3001 cloudflare-navigator-backend:latest
```

### 2. Docker Compose Deployment

For a complete deployment with both frontend and backend:
```bash
docker-compose up -d
```

### Environment Variables for Container Configuration

The following environment variables can be configured during container deployment:

#### Backend Environment Variables
| Variable | Description | Default Value | Example |
|----------|-------------|---------------|---------|
| `NODE_ENV` | Node.js environment | `production` | `development` |

#### Frontend Environment Variables
| Variable | Description | Default Value | Example |
|----------|-------------|---------------|---------|
| `BACKEND_SERVICE_URL` | Backend API URL | `http://backend:3001/` | `http://your-api-server:3001/` |

## Nginx Configuration

The frontend uses Nginx to serve static files and proxy API requests to the backend. The main features of our Nginx configuration:

1. **Environment Variable Substitution**: The backend URL is configurable via the `BACKEND_SERVICE_URL` environment variable
2. **API Proxying**: All requests to `/api/` are forwarded to the backend service
3. **CORS Headers**: Appropriate CORS headers are added to API responses
4. **SPA Support**: All frontend routes are properly handled for the Single Page Application

### Troubleshooting Nginx Configuration

If you encounter issues with the Nginx configuration:

1. Check container logs: `docker logs <frontend-container-id>`
2. Verify environment variables are correctly passed to the container
3. Ensure the backend service is reachable from the frontend container
4. If using custom networks, make sure both containers are on the same network
5. For advanced debugging, you can exec into the container: `docker exec -it <frontend-container-id> /bin/bash`

## Quick Start

To set up the project locally:

1. **Create the required files** mentioned in the important section above
2. **Install dependencies**:
   ```bash
   npm run install:all
   ```
3. **Run development servers**:
   ```bash
   # Run frontend
   npm run start
   
   # Run backend in a separate terminal
   npm run start:server
   ```
4. **For Docker deployment**:
   ```bash
   npm run docker:build
   npm run docker:up
   ```

## License

Distributed under the MIT License.
