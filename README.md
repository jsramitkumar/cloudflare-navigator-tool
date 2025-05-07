
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

## Prerequisites

- Node.js (version 18 or higher)
- npm or Bun
- Docker (for containerized deployment)
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

## Docker Deployment

You can deploy Cloudflare Navigator using Docker with extensive customization options.

### Environment Variables for Container Configuration

The following environment variables can be configured during container deployment:

| Variable | Description | Default Value | Example |
|----------|-------------|---------------|---------|
| `API_URL` | Cloudflare API endpoint | `https://api.cloudflare.com/client/v4` | `https://custom-api.cloudflare.com` |
| `FRONTEND_URL` | URL where the frontend is accessible | `http://localhost:8080` | `https://cloudflare.example.com` |
| `BACKEND_URL` | URL where the backend API is accessible | `http://localhost:3001` | `https://api.cloudflare.example.com` |
| `PORT` | Port for the backend API | `3001` | `8080` |

### Security Note

The application is now configured to run the frontend and backend on separate ports:
- Frontend runs on port 8080
- Backend API runs on port 3001
- All API endpoints are accessible under the `/api` path

### Deployment Examples

#### Basic Docker Compose
```yaml
version: '3.8'
services:
  cloudflare-navigator-backend:
    image: jsrankit/dns-cloudflare:latest
    ports:
      - "3001:3001"
    environment:
      - FRONTEND_URL=http://localhost:8080
      - API_URL=https://api.cloudflare.com/client/v4
    restart: always
  
  cloudflare-navigator-frontend:
    image: nginx:stable-alpine
    ports:
      - "8080:80"
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - cloudflare-navigator-backend
```

#### Custom Port Configuration
```bash
docker run -d \
  -p 8081:3001 \
  -e PORT=3001 \
  -e FRONTEND_URL=https://cloudflare.example.com \
  -e BACKEND_URL=https://api.cloudflare.example.com \
  jsrankit/dns-cloudflare:latest
```

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

## Project Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod (form validation)
- Tanstack React Query

## Troubleshooting

- Check if your application URLs are configured correctly in the environment variables
- Verify network connectivity to Cloudflare API
- Ensure Docker containers have proper port mapping
- Validate API credentials in the application settings
- Check logs using `docker logs [container_name]`

## License

Distributed under the MIT License.

## Contact

Amit Gupta
Project Link: [https://github.com/jsramitkumar/cloudflare-navigator-tool](https://github.com/jsramitkumar/cloudflare-navigator-tool)
