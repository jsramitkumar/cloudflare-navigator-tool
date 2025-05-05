
#!/bin/sh

# Log environment information
echo "Starting with configuration:"
echo "API URL: ${API_URL}"
echo "FRONTEND URL: ${FRONTEND_URL}"
echo "BACKEND URL: ${BACKEND_URL:-https://localhost:${PORT}}"
echo "Frontend Port: ${FRONTEND_PORT:-8080}"
echo "Backend Port: ${PORT:-3001}"
echo "Environment: ${NODE_ENV}"

# Start the Express backend server
cd /app/server
node index.js &

# Serve the frontend using a simple HTTP server
cd /app
npx serve -s dist -l ${FRONTEND_PORT:-8080}

# Keep the container running
wait
