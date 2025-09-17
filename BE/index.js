import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import cors from 'cors';
import axios from 'axios';
import path from 'path';

const app = express();
const now = new Date();

// Store for active users and IP logging
const activeUsers = new Map(); // sessionId -> { lastSeen: timestamp, ip: string }
const LOG_DIR = '/app/logs';
const IP_LOG_FILE = path.join(LOG_DIR, 'publicip.txt');

// Ensure logs directory exists with proper error handling
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log(`Created logs directory: ${LOG_DIR}`);
  }
  
  // Test write permission
  const testFile = path.join(LOG_DIR, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log(`Logs directory is writable: ${LOG_DIR}`);
} catch (error) {
  console.error('Failed to create or access logs directory:', error);
  console.error('IP logging may not work properly');
}

// Function to get client IP address
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.ip || 
         'unknown';
};

// Function to log IP address with timestamp
const logIPAddress = (ip) => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const timestamp = `${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`;
  const logEntry = `${timestamp} - Public IP: ${ip}\n`;
  
  try {
    // Ensure directory exists before each write
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    
    fs.appendFileSync(IP_LOG_FILE, logEntry);
    console.log(`IP logged: ${ip} at ${timestamp}`);
  } catch (error) {
    console.error('Failed to log IP address:', error);
    console.error('Log directory:', LOG_DIR);
    console.error('Log file path:', IP_LOG_FILE);
    
    // Try alternative log location
    try {
      const altLogFile = path.join(process.cwd(), 'publicip.txt');
      fs.appendFileSync(altLogFile, logEntry);
      console.log(`IP logged to alternative location: ${altLogFile}`);
    } catch (altError) {
      console.error('Failed to log to alternative location:', altError);
    }
  }
};

// Cleanup inactive users (older than 60 seconds)
const cleanupInactiveUsers = () => {
  const cutoff = Date.now() - 60000; // 60 seconds
  for (const [sessionId, userData] of activeUsers.entries()) {
    if (userData.lastSeen < cutoff) {
      activeUsers.delete(sessionId);
    }
  }
};

// Environment variables  
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const API_URL = process.env.API_URL || 'https://api.cloudflare.com/client/v4';
const SSL_ENABLED = process.env.SSL_ENABLED === 'true';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || '/app/ssl/fullchain.pem';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || '/app/ssl/privkey.pem';
const SSL_PORT = process.env.SSL_PORT || 3443;

// Log all environment variables for debugging
console.log('========= SERVER ENVIRONMENT VARIABLES =========');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('HOST:', HOST);
console.log('API_URL:', API_URL);
console.log('SSL_ENABLED:', SSL_ENABLED);
console.log('===============================================');

// Enable CORS for all origins
app.use(cors({
  origin: '*',  // Allow all origins
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  // Log IP for all requests
  const clientIP = getClientIP(req);
  logIPAddress(clientIP);
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

// User presence endpoints
app.post('/api/users/presence', (req, res) => {
  try {
    const { sessionId } = req.body;
    const clientIP = getClientIP(req);
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }
    
    // Update user presence
    activeUsers.set(sessionId, {
      lastSeen: Date.now(),
      ip: clientIP
    });
    
    // Cleanup inactive users
    cleanupInactiveUsers();
    
    res.json({
      success: true,
      activeUsers: activeUsers.size,
      sessionId
    });
  } catch (error) {
    console.error('Presence update error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/users/count', (req, res) => {
  try {
    // Cleanup inactive users before counting
    cleanupInactiveUsers();
    
    res.json({
      success: true,
      activeUsers: activeUsers.size
    });
  } catch (error) {
    console.error('User count error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/api/users/presence', (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId && activeUsers.has(sessionId)) {
      activeUsers.delete(sessionId);
    }
    
    res.json({
      success: true,
      activeUsers: activeUsers.size
    });
  } catch (error) {
    console.error('Presence removal error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Cleanup inactive users every 30 seconds
setInterval(cleanupInactiveUsers, 30000);

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

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(PORT, HOST, () => {
  console.log(`HTTP Server running on http://${HOST}:${PORT}`);
  console.log(`API URL: ${API_URL}`);
});

// Start HTTPS server if SSL is enabled and certificates exist
if (SSL_ENABLED) {
  try {
    if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
      const sslOptions = {
        cert: fs.readFileSync(SSL_CERT_PATH),
        key: fs.readFileSync(SSL_KEY_PATH)
      };
      
      const httpsServer = https.createServer(sslOptions, app);
      httpsServer.listen(SSL_PORT, HOST, () => {
        console.log(`HTTPS Server running on https://${HOST}:${SSL_PORT}`);
      });
    } else {
      console.log('SSL enabled but certificates not found. Running HTTP only.');
    }
  } catch (error) {
    console.error('SSL setup failed:', error.message);
    console.log('Running HTTP only.');
  }
} else {
  console.log('SSL disabled. Running HTTP only.');
}

export default app;