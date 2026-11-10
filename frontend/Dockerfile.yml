
# Stage 1: Build React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Build production application
RUN npm run build


# Stage 2: Serve application using Nginx
FROM nginx:alpine

# Copy production build
COPY --from=build /app/dist /usr/share/nginx/html

# Expose application port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
