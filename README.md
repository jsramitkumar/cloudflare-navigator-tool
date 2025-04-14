
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
- A Cloudflare account with API access

## Network Requirements

### Internet Connectivity
- Stable broadband internet connection
- Minimum bandwidth: 1 Mbps recommended
- Outbound HTTPS access (Port 443) to:
  - `api-cloudflare.endusercompute.in`
  - `api.cloudflare.com`

### Firewall and Security
- Ensure your network allows outbound HTTPS connections
- Whitelist the following domains if using strict network policies:
  - `api-cloudflare.endusercompute.in`
  - `api.cloudflare.com`

### Proxy Configuration
- If your organization uses a proxy server, configure the application to use the proxy settings
- Supported proxy types: HTTP, HTTPS

### DNS and SSL/TLS
- The application requires secure HTTPS connections
- SSL/TLS version 1.2 or higher recommended
- Valid SSL certificates must be in place for API communication

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cloudflare-navigator.git
cd cloudflare-navigator
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using Bun:
```bash
bun install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

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

#### How to Find Your Cloudflare Credentials

- **API Key**: 
  - Log in to Cloudflare
  - Go to My Profile > API Tokens
  - Create a new API token with appropriate permissions
- **Account ID**: Found in the Cloudflare dashboard URL or account settings
- **Zone ID**: Found in the DNS section of your domain's Cloudflare dashboard

## Project Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod (form validation)
- Tanstack React Query

## Security Notes

- Credentials are stored locally in your browser
- Always keep your API keys confidential
- Use read-only or scoped API tokens when possible

## Troubleshooting Network Issues

1. Check your internet connection
2. Verify firewall and proxy settings
3. Ensure you have the latest version of the application
4. Check API endpoint status
5. Validate SSL/TLS configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - Amit Gupta

Project Link: [https://github.com/jsramitkumar/cloudflare-navigator-tool](https://github.com/jsramitkumar/cloudflare-navigator-tool)

