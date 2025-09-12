# Backend Microservice

Express.js API server that acts as a proxy to the Cloudflare API.

## Technologies

- Node.js
- Express.js
- Axios for HTTP requests
- CORS middleware

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### Production

```bash
npm start
```

## Environment Variables

Create a `.env` file:

```
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
API_URL=https://api.cloudflare.com/client/v4
```

## API Endpoints

### Cloudflare Proxy Endpoints

- `GET /api/cloudflare/test-connection` - Test connection
- `GET /api/cloudflare/dns` - List DNS records
- `POST /api/cloudflare/dns` - Create DNS record
- `PUT /api/cloudflare/dns/:id` - Update DNS record
- `DELETE /api/cloudflare/dns/:id` - Delete DNS record
- `GET /api/cloudflare/tunnels` - List tunnels
- `POST /api/cloudflare/tunnels` - Create tunnel
- And more...

## Authentication

The API uses Cloudflare credentials passed via headers:
- `X-CF-API-KEY`: Cloudflare API Key
- `X-CF-EMAIL`: Cloudflare Email
- `X-CF-ACCOUNT-ID`: Cloudflare Account ID
- `X-CF-ZONE-ID`: Cloudflare Zone ID