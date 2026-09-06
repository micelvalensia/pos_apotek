# ==============================================================================
# Stage 1: Frontend Asset Builder (Node.js)
# ==============================================================================
FROM node:20-slim AS node-builder

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source and configuration files
COPY tsconfig.json vite.config.ts ./
COPY resources ./resources
COPY public ./public

# Build production bundle
RUN npm run build

# ==============================================================================
# Stage 2: Composer Dependency Builder (PHP Composer)
# ==============================================================================
FROM composer:2 AS composer-builder

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# ==============================================================================
# Stage 3: Production Runtime (PHP 8.3-FPM Alpine)
# ==============================================================================
FROM php:8.3-fpm-alpine AS production

# Install essential system dependencies and PHP extension libraries
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    mysql-client \
    su-exec

# Configure and install PHP extensions required by Laravel & POS
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        bcmath \
        opcache \
        intl \
        zip \
        pcntl \
        gd

# Copy PHP and OPcache configuration
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

# Copy source code
COPY . .

# Copy production vendors from composer-builder stage
COPY --from=composer-builder /app/vendor ./vendor

# Copy compiled frontend assets from node-builder stage
COPY --from=node-builder /app/public/build ./public/build

# Copy entrypoint script and set executable permissions
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set directory permissions for web server (www-data)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
