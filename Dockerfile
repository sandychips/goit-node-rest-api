# Build a lightweight Node.js runtime image
FROM node:20-bookworm-slim AS base

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Ensure production mode
ENV NODE_ENV=production

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
