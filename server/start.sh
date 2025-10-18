#!/bin/sh
# Startup script for Railway deployment
# Runs database migrations before starting the server

echo "🚀 Starting Toosila Backend..."

# Change to server directory
cd /app/server

# Run database migrations
echo "📊 Running database migrations..."
node scripts/setup-database.js

# Check if migrations succeeded
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
    echo "🌐 Starting Express server..."
    node server.js
else
    echo "❌ Database migrations failed"
    exit 1
fi
