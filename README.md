# Cloudflare Navigator

A microservices-based application for managing Cloudflare DNS records and tunnels.

## Architecture

This project is structured as two independent microservices:

### 🎨 Frontend Microservice (`FE/`)
- **Technology**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix
- **State**: TanStack Query + React Hook Form
- **Port**: 8080 (development)

### 🚀 Backend Microservice (`BE/`)
- **Technology**: Node.js + Express.js
- **Purpose**: Cloudflare API proxy
- **Port**: 3001

## Quick Start

### Development Mode

#### Frontend
```bash
cd FE/
npm install
npm run dev
```

#### Backend
```bash
cd BE/
npm install
npm run dev
```

### Docker Deployment

#### Using Docker Compose (Recommended)
```bash
# Build and start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Manual Docker Build
```bash
# Build frontend
docker build -t cloudflare-navigator-fe ./FE

# Build backend
docker build -t cloudflare-navigator-be ./BE

# Run with SSL support (optional)
docker run -p 8080:8080 -p 8443:8443 -v ./ssl:/app/ssl:ro cloudflare-navigator-fe
docker run -p 3001:3001 -p 3443:3443 -v ./ssl:/app/ssl:ro cloudflare-navigator-be
```

## Features

- **DNS Management**: Full CRUD operations for DNS records
- **Tunnel Management**: Cloudflare tunnel configuration
- **Multi-Account**: Support for multiple Cloudflare accounts
- **Real-time Updates**: Auto-refresh capabilities
- **Responsive Design**: Mobile-first approach
- **Theme Support**: Dark/Light mode toggle

## Environment Configuration

### Frontend (`FE/.env.local`)
```env
VITE_BACKEND_URL=http://localhost:3001
```

### Backend (`BE/.env`)
```env
NODE_ENV=development
PORT=3001
API_URL=https://api.cloudflare.com/client/v4
```

## SSL/TLS Support

Both frontend and backend Docker containers support SSL/TLS:

### SSL Configuration
```env
# Enable SSL
SSL_ENABLED=true
SSL_CERT_PATH=/app/ssl/cert.pem
SSL_KEY_PATH=/app/ssl/key.pem
SSL_PORT=8443  # Frontend
SSL_PORT=3443  # Backend
```

### SSL Certificate Mounting
Place your SSL certificates in a `./ssl/` directory:
```
ssl/
├── cert.pem
└── key.pem
```

The Docker containers will mount this directory and serve HTTPS when `SSL_ENABLED=true`.

## Version Management

The application displays version information in the bottom-right corner. Version info is managed through:
- `version.json` - Contains version metadata
- Build process updates version with timestamp in `MMDDYYYY.HHMM` format

## Microservice Independence

Each service can be:
- Developed independently
- Deployed separately
- Scaled individually
- Tested in isolation

For detailed setup instructions, see individual README files in `FE/` and `BE/` directories.
