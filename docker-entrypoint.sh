
#!/bin/sh

# Log environment information
echo "Starting with configuration:"
echo "API URL: ${API_URL}"
echo "Backend Port: ${PORT:-3001}"
echo "Environment: ${NODE_ENV}"

# Start the Express backend server
cd /app/server
node index.js

# The container will keep running as long as the node process is active
