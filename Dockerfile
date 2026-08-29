# Multi-stage build for ARM64 (Raspberry Pi 4 / 5) & AMD64
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Stage 2: Node.js Backend Server & Native SQLite build
FROM node:20-alpine AS runner
WORKDIR /app

# Install native dependencies required for better-sqlite3 compilation
RUN apk add --no-cache python3 make g++ sqlite

# Copy backend dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy backend source code
COPY server/ ./

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/client/dist /app/client/dist

# Environment settings
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Ensure data directory exists
RUN mkdir -p /app/data

# Expose default HTTP / WebSocket port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/status || exit 1


# Start dashboard server
CMD ["node", "src/index.js"]
