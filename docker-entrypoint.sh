
#!/bin/sh

# Log environment information
echo "Starting with configuration:"
echo "API URL: ${API_URL}"
echo "Frontend URL: ${FRONTEND_URL}"
echo "Backend Port: ${PORT}"

# Start the Express backend server
cd /app/server
node index.js &

# Serve the frontend using a simple HTTP server
cd /app
npx serve -s dist -l 8080

# Keep the container running
wait
