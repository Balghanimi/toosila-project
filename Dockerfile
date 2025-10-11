# ========================================
# Multi-Stage Dockerfile for Toosila
# Railway Deployment - Express serves React
# ========================================

# ==================== STAGE 1: Frontend Builder ====================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy client source
COPY client/ ./

# Build React app
RUN npm run build

# ==================== STAGE 2: Backend Dependencies ====================
FROM node:22-alpine AS backend-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# ==================== STAGE 3: Production ====================
FROM node:22-alpine AS production

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copy server with production dependencies
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY server/ ./server/

# Copy built frontend
COPY --from=frontend-builder /app/client/build ./build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port (Railway will override with $PORT)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/api/health || exit 1

# Start the server directly (no shell script needed)
CMD ["node", "server/server.js"]
