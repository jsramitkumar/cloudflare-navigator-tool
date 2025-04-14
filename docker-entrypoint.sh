
#!/bin/sh

# Start the Express backend server
cd /app/server
node index.js &

# Serve the frontend using a simple HTTP server
cd /app
npx serve -s dist -l 8080

# Keep the container running
wait
