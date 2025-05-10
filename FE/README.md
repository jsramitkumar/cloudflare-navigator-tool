
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
docker build -t cloudflare-navigator-frontend:latest -f Dockerfile.frontend .

# Run the frontend container
docker run -d -p 8080:8080 -e API_URL=http://your-backend-url:3001/api cloudflare-navigator-frontend:latest
```

#### Backend Deployment
```bash
# Build the backend image
docker build -t cloudflare-navigator-backend:latest -f Dockerfile .

# Run the backend container
docker run -d -p 3001:3001 -e API_URL=https://api.cloudflare.com/client/v4 cloudflare-navigator-backend:latest
```

### 2. Docker Compose Deployment

#### Frontend Only
```bash
docker-compose -f frontend-docker-compose.yml up -d
```

#### Backend Only
```bash
docker-compose -f backend-docker-compose.yml up -d
```

#### Combined Deployment
```bash
docker-compose -f combined-docker-compose.yml up -d
```

### Environment Variables for Container Configuration

The following environment variables can be configured during container deployment:

#### Backend Environment Variables
| Variable | Description | Default Value | Example |
|----------|-------------|---------------|---------|
| `API_URL` | Cloudflare API endpoint | `https://api.cloudflare.com/client/v4` | `https://custom-api.cloudflare.com` |
| `PORT` | Port for the backend API | `3001` | `8080` |
| `NODE_ENV` | Node.js environment | `production` | `development` |
| `HOST` | Hostname to bind to | `0.0.0.0` | `localhost` |

#### Frontend Environment Variables
| Variable | Description | Default Value | Example |
|----------|-------------|---------------|---------|
| `API_URL` | Backend API URL | `/api` | `http://backend-service:3001/api` |

#### Combined Deployment Environment Variables
| Variable | Description | Default Value | Example |
|----------|-------------|---------------|---------|
| `BACKEND_IMAGE` | Backend Docker image | `jsrankit/cloudflare-dns-backend:latest` | `myregistry/backend:v1.0` |
| `FRONTEND_IMAGE` | Frontend Docker image | `jsrankit/cloudflare-dns-frontend:latest` | `myregistry/frontend:v1.0` |
| `BACKEND_URL` | URL for frontend to reach backend | `http://cloudflare-navigator-backend:3001/api` | `https://api.example.com` |
| `PORT` | Backend port | `3001` | `8080` |

## Configuration

### Cloudflare API Credentials

1. Navigate to the Settings page in the application
2. Click "Add New Cloudflare Account"
3. Enter the following details:
   - Account Name (custom name for your reference)
   - API Key
   - Email (optional)
   - Account ID
   - Zone ID

### Backend API URL Configuration

1. Navigate to the Settings page
2. In the "Backend API Configuration" section:
   - Enter the full URL to your backend API (e.g., `http://localhost:3001/api`)
   - Click "Save and Test Connection" to verify connectivity

## Project Structure

```
├── Dockerfile            # Backend Dockerfile
├── Dockerfile.frontend   # Frontend Dockerfile
├── docker-compose.yml    # Combined deployment configuration
├── frontend-docker-compose.yml # Frontend-only deployment
├── backend-docker-compose.yml  # Backend-only deployment
├── nginx.conf            # Nginx configuration for frontend
├── src/
│   ├── components/       # React components
│   ├── pages/            # Application pages
│   ├── services/         # API services
│   └── server/           # Backend Express server
```

## Troubleshooting

- Check if your application URLs are configured correctly in the environment variables
- Verify network connectivity to Cloudflare API
- Ensure Docker containers have proper port mapping
- Validate API credentials in the application settings
- Check logs using `docker logs [container_name]`
- Test backend connectivity in the Settings page

## License

Distributed under the MIT License.

## Contact

Amit Gupta
Project Link: [https://github.com/jsramitkumar/cloudflare-navigator-tool](https://github.com/jsramitkumar/cloudflare-navigator-tool)
