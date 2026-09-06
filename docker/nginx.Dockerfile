# Stage Nginx Production Image with built static assets
FROM node:20-slim AS frontend-builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts ./
COPY resources ./resources
COPY public ./public
RUN npm run build

FROM nginx:alpine

# Copy custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy public static assets including Vite production build from builder
COPY public /var/www/html/public
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
