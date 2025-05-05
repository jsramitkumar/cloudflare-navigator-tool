
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
| `FRONTEND_URL` | URL where the frontend is accessible | `https://localhost:8080` | `https://cloudflare.example.com` |
| `BACKEND_URL` | URL where the backend is accessible | `https://localhost:3001` | `https://api.example.com` |
| `FRONTEND_PORT` | Port exposed for the frontend | `8080` | `8443` |
| `BACKEND_PORT` | Port exposed for the backend API | `3001` | `5000` |

### Deployment Examples

#### Basic Docker Run
```bash
docker run -d \
  -p 8080:8080 \
  -p 3001:3001 \
  -e FRONTEND_URL=https://cloudflare.example.com \
  -e BACKEND_URL=https://api.example.com \
  jsrankit/dns-cloudflare:latest
```

#### Docker Compose Example
```yaml
version: '3.8'
services:
  cloudflare-navigator:
    image: jsrankit/dns-cloudflare:latest
    ports:
      - "8080:8080"
      - "3001:3001"
    environment:
      - FRONTEND_URL=https://cloudflare.example.com
      - BACKEND_URL=https://api.example.com
      - API_URL=https://api.cloudflare.com/client/v4
    restart: always
```

#### Custom Port Configuration
```bash
docker run -d \
  -p 8443:8443 \
  -p 5000:5000 \
  -e FRONTEND_PORT=8443 \
  -e BACKEND_PORT=5000 \
  -e FRONTEND_URL=https://cloudflare.example.com \
  -e BACKEND_URL=https://api.example.com \
  jsrankit/dns-cloudflare:latest
```

## Configuration

### HTTPS Support

The application now supports HTTPS by default for both frontend and backend. If you need to use self-signed certificates in a development environment, make sure to:

1. Accept the self-signed certificate in your browser when accessing the frontend
2. Set up proper certificates for production use

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

- Check if your URLs are configured correctly in the environment variables
- Ensure your SSL certificates are valid if using HTTPS
- Verify network connectivity between frontend and backend
- Ensure Docker container has proper port mappings
- Validate API credentials in the application settings
- Check logs using `docker logs [container_name]`

## License

Distributed under the MIT License.

## Contact

Amit Gupta
Project Link: [https://github.com/jsramitkumar/cloudflare-navigator-tool](https://github.com/jsramitkumar/cloudflare-navigator-tool)
