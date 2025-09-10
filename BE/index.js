const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const now = new Date();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const API_URL = process.env.API_URL || 'https://api.cloudflare.com/client/v4';

// Log all environment variables for debugging
console.log('========= SERVER ENVIRONMENT VARIABLES =========');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('HOST:', HOST);
console.log('API_URL:', API_URL);
console.log('===============================================');

// Enable CORS for all origins
app.use(cors({
  origin: '*',  // Allow all origins
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  next();
});

// Extract Cloudflare credentials from headers
const extractCredentials = (req) => {
  return {
    apiKey: req.headers['x-cf-api-key'],
    email: req.headers['x-cf-email'],
    accountId: req.headers['x-cf-account-id'],
    zoneId: req.headers['x-cf-zone-id']
  };
};

// Make request to Cloudflare API
const callCloudflareApi = async (req, endpoint, method, data = null) => {
  const { apiKey, email, accountId, zoneId } = extractCredentials(req);
  
  // Check if credentials are provided
  if (!apiKey || !zoneId) {
    throw {
      status: 400,
      message: 'Missing required credentials',
      details: {
        errors: [{ message: 'API key and Zone ID are required' }]
      }
    };
  }
  
  // Construct the base URL for different API resources
  let baseUrl = API_URL;
  
  // Determine the full endpoint based on the resource type
  let fullEndpoint = '';
  
  if (endpoint.startsWith('/dns')) {
    // DNS endpoints use zones
    const path = endpoint.replace('/dns', '');
    fullEndpoint = `/zones/${zoneId}/dns_records${path}`;
  } else if (endpoint.startsWith('/tunnels')) {
    if (endpoint.includes('/configurations')) {
      // Tunnel configurations need to use cfd_tunnel
      const tunnelId = endpoint.split('/')[2];
      fullEndpoint = `/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`;
    } else if (endpoint.includes('/delete_config')) {
      // Special case for deleting configurations
      const tunnelId = endpoint.split('/')[2];
      fullEndpoint = `/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`;
    } else {
      // Regular tunnel endpoints
      const path = endpoint.replace('/tunnels', '');
      fullEndpoint = `/accounts/${accountId}/tunnels${path}`;
    }
  } else {
    fullEndpoint = endpoint;
  }
  
  const formattedUTC = `${now.getUTCFullYear()}-${(now.getUTCMonth()+1).toString().padStart(2, '0')}-${now.getUTCDate().toString().padStart(2, '0')} ` + `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')}`;
  console.log(`[${formattedUTC} UTC] Making ${method} request to: ${baseUrl}${fullEndpoint}`);
  
  try {
    // Use Global API Key authentication
    const headers = {
      'X-Auth-Key': apiKey,
      'X-Auth-Email': email,
      'Content-Type': 'application/json'
    };
    
    const response = await axios({
      method,
      url: `${baseUrl}${fullEndpoint}`,
      headers,
      data: method !== 'GET' ? data : undefined
    });
    
    return response.data;
  } catch (error) {
    console.error('Cloudflare API error:', error.response?.data || error.message);
    console.error('Request details:', {
      method,
      url: `${baseUrl}${fullEndpoint}`,
      headers: { 'X-Auth-Key': '***REDACTED***', 'X-Auth-Email': email },
      data: method !== 'GET' ? JSON.stringify(data) : undefined
    });
    
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.errors?.[0]?.message || 'An error occurred',
      details: error.response?.data
    };
  }
};

// API Routes
// Test connection endpoint
app.get('/api/cloudflare/test-connection', async (req, res) => {
  try {
    // Make a simple API call to verify credentials
    //const data = await callCloudflareApi(req, '/zones', 'GET');
    const formattedUTC = `${now.getUTCFullYear()}-${(now.getUTCMonth()+1).toString().padStart(2, '0')}-${now.getUTCDate().toString().padStart(2, '0')} ` + `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')}`;
    console.log(`[${formattedUTC} UTC]`,'Test connection successful');
    res.json({ 
      success: true, 
      message: 'Connection successful',
      serverInfo: {
        apiUrl: API_URL,
        port: PORT
      }
    });
  } catch (error) {
    console.error('Test connection failed:', error.message);
    res.status(error.status || 500).json({ 
      success: false, 
      message: `Connection failed: ${error.message}`,
      details: error.details,
      serverInfo: {
        apiUrl: API_URL,
        port: PORT
      }
    });
  }
});

// DNS Records endpoints
app.get('/api/cloudflare/dns', async (req, res) => {
  try {
    // console.log('DNS Records list request received');
    const data = await callCloudflareApi(req, '/dns', 'GET');
    res.json(data);
  } catch (error) {
    console.error('DNS Records error:', error.message);
    res.status(error.status || 500).json({ success: false, message: error.message, details: error.details });
  }
});

app.get('/api/cloudflare/dns/:id', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/dns/${req.params.id}`, 'GET');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

app.post('/api/cloudflare/dns', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, '/dns', 'POST', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

app.put('/api/cloudflare/dns/:id', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/dns/${req.params.id}`, 'PUT', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

app.delete('/api/cloudflare/dns/:id', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/dns/${req.params.id}`, 'DELETE');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// Tunnels endpoints
app.get('/api/cloudflare/tunnels', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, '/tunnels', 'GET');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

app.get('/api/cloudflare/tunnels/:id', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/tunnels/${req.params.id}`, 'GET');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

app.post('/api/cloudflare/tunnels', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, '/tunnels', 'POST', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

app.delete('/api/cloudflare/tunnels/:id', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/tunnels/${req.params.id}`, 'DELETE');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// Tunnel Configurations endpoints
app.get('/api/cloudflare/tunnels/:id/configurations', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/tunnels/${req.params.id}/configurations`, 'GET');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

app.put('/api/cloudflare/tunnels/:id/configurations', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/tunnels/${req.params.id}/configurations`, 'PUT', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

app.patch('/api/cloudflare/tunnels/:id/configurations', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/tunnels/${req.params.id}/configurations`, 'PATCH', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// Add specific endpoint for deleting tunnel configurations
app.delete('/api/cloudflare/tunnels/:id/configurations', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, `/tunnels/${req.params.id}/delete_config`, 'DELETE', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// Add a global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? null : err.stack,
    serverInfo: {
      apiUrl: API_URL,
      port: PORT,
      host: HOST
    }
  });
});

// Start server listening on all interfaces
app.listen(PORT, HOST, () => {
  console.log(`Backend server running on ${HOST}:${PORT}`);
  console.log(`API URL: ${API_URL}`);
});

module.exports = app;