#!/bin/sh

echo "🚀 Starting Toosila Backend..."

# We're already in /app directory from Dockerfile
cd /app/server || exit 1

echo "📊 Environment: $NODE_ENV"
echo "📍 Working directory: $(pwd)"

# Start the server
echo "🚀 Starting Express server..."
exec node server.js
