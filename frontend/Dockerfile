# =====================
# Stage 1: Build
# =====================
FROM oven/bun:canary AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy source code, run tests and build the app
COPY . .
RUN bun test
RUN bun run build

# =====================
# Stage 2: Production
# =====================
FROM nginx:alpine

# Copy the built files from the builder stage
# Vite outputs to "dist/" folder
# nginx serves files from /usr/share/nginx/html
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# nginx runs automatically, no CMD needed