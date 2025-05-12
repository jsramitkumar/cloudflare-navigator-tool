
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_SERVICE_URL = process.env.BACKEND_SERVICE_URL || 'http://localhost:3001/';

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Setup API proxy
app.use('/api', createProxyMiddleware({
  target: BACKEND_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  },
  onProxyRes: (proxyRes) => {
    // Add CORS headers
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
  }
}));

// Handle OPTIONS requests for CORS preflight
app.options('/api/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization');
  res.sendStatus(204);
});

// For SPA routing, serve index.html for any non-matching routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API requests will be proxied to ${BACKEND_SERVICE_URL}`);
});
