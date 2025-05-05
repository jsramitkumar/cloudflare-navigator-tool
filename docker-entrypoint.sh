
#!/bin/sh

# Log environment information
echo "Starting with configuration:"
echo "API URL: ${API_URL}"
echo "FRONTEND URL: ${FRONTEND_URL}"
echo "BACKEND URL: ${BACKEND_URL:-http://localhost:${PORT}}"
echo "Port: ${PORT:-3001}"
echo "Environment: ${NODE_ENV}"

# Start the Express backend server which will also serve frontend static files
cd /app/server
node index.js

# Wait to keep container running (shouldn't reach here as node should block)
wait

