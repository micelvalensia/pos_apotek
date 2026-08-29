FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# System dependencies
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    mysql-client

# PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    intl \
    bcmath \
    opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy dependency files first
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

# Copy application
COPY . .

# Build frontend
RUN apk add --no-cache nodejs npm

RUN npm ci
RUN npm run build

# Laravel permissions
RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

USER www-data

EXPOSE 9000

CMD ["php-fpm"]