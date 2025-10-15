# Multi-stage build for Toosila Ride-Sharing App
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm ci --only=production

# Frontend build stage
FROM base AS frontend-builder

# Copy client package files
COPY client/package*.json ./client/

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Copy client source
COPY client/ ./

# Build the React app
RUN npm run build

# Backend stage
FROM base AS backend-builder

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install serve globally for frontend
RUN npm install -g serve

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/client/build ./build

# Copy backend from backend-builder
COPY --from=backend-builder /app/server ./server

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm ci --only=production

# Create startup script
RUN cat > /app/start.sh << 'EOF'\n\
#!/bin/sh\n\
# Set default port if not provided\n\
if [ -z "$PORT" ]; then\n\
  export PORT=3000\n\
fi\n\
# Start backend in background\n\
cd /app/server\n\
PORT=5001 node server.js &\n\
# Wait a moment for backend to start\n\
sleep 2\n\
# Start frontend\n\
cd /app\n\
serve -s build -l $PORT\n\
EOF\n\
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/ || exit 1

# Start command
CMD ["/bin/sh", "/app/start.sh"]
