# Cloudflare Navigator

A microservices-based application for managing Cloudflare DNS records and tunnels.

## Architecture

This project is structured as two independent microservices:

### 🎨 Frontend Microservice (`FE/`)
- **Technology**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **State**: TanStack Query + React Hook Form
- **Port**: 8080 (development)

### 🚀 Backend Microservice (`BE/`)
- **Technology**: Node.js + Express.js
- **Purpose**: Cloudflare API proxy
- **Port**: 3001

## Quick Start

### Frontend
```bash
cd FE/
npm install
npm run dev
```

### Backend
```bash
cd BE/
npm install
npm run dev
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

## Microservice Independence

Each service can be:
- Developed independently
- Deployed separately
- Scaled individually
- Tested in isolation

For detailed setup instructions, see individual README files in `FE/` and `BE/` directories.