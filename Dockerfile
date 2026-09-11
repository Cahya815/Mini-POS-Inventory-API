# Runtime stage only (no build stage needed for JavaScript)
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma Client
RUN npm run prisma:generate

# Copy source code
COPY src ./src

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "src/server.js"]
