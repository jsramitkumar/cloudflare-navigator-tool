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
   - **Important**: The URL must include the full path to the API without the `/cloudflare` suffix
   - Example: If your backend is at `http://backend-server:3001`, use `http://backend-server:3001/api`

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

- **Custom API URL Issues**: 
  - Ensure the URL entered in Settings includes `/api` but NOT `/cloudflare`
  - Example correct format: `http://your-backend:3001/api`
  - After saving, test the connection using the "Save and Test Connection" button
  - If connection fails, check backend logs and network connectivity

- **General Issues**:
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
