
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

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
  
  // Construct the base URL for different API resources
  let baseUrl = 'https://api.cloudflare.com/client/v4';
  
  // Determine the full endpoint based on the resource type
  let fullEndpoint = '';
  
  if (endpoint.startsWith('/dns')) {
    // DNS endpoints use zones
    const path = endpoint.replace('/dns', '');
    fullEndpoint = `/zones/${zoneId}/dns_records${path}`;
  } else if (endpoint.startsWith('/tunnels')) {
    // Check if this is a configuration endpoint
    if (endpoint.includes('/configurations')) {
      const tunnelId = endpoint.split('/')[2];
<<<<<<< HEAD
      fullEndpoint = `/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`;
=======
      fullEndpoint = `/accounts/${accountId}/tunnels/${tunnelId}/configurations`;
>>>>>>> 6d253344ddf14c528047a0c4de5dfeb1f9647103
    } else {
      // Regular tunnel endpoints use accounts
      const path = endpoint.replace('/tunnels', '');
      fullEndpoint = `/accounts/${accountId}/tunnels${path}`;
    }
  } else {
    fullEndpoint = endpoint;
  }
  
  console.log(`Making ${method} request to: ${baseUrl}${fullEndpoint}`);
  
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
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.errors?.[0]?.message || 'An error occurred',
      details: error.response?.data
    };
  }
};

// DNS Records endpoints
app.get('/api/cloudflare/dns', async (req, res) => {
  try {
    const data = await callCloudflareApi(req, '/dns', 'GET');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add a catch-all route for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

module.exports = app;
