
#!/bin/sh

# Log environment information
echo "Starting with configuration:"
echo "API URL: ${API_URL}"
echo "FRONTEND URL: ${FRONTEND_URL:-http://localhost:8080}"
echo "BACKEND URL: ${BACKEND_URL:-http://localhost:3001}"
echo "BACKEND Port: ${PORT:-3001}"
echo "Environment: ${NODE_ENV}"

# Start the Express backend server
cd /app/server
node index.js

# Wait to keep container running (shouldn't reach here as node should block)
wait
