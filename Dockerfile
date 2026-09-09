# Build stage
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev, for ts-node and nodemon in dev mode)
RUN npm ci

# Rebuild native modules
RUN npm rebuild

# Copy built app from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy source code for ts-node (development)
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/server.js"]

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/server.js"]