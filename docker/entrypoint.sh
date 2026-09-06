#!/bin/sh
set -e

# Remove any stale bootstrap cache files
rm -f /var/www/html/bootstrap/cache/*.php

# Ensure storage directories exist with correct permissions
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

# Run database migrations and cache optimizations if in production
if [ "$APP_ENV" = "production" ]; then
    echo "Waiting for database connection at ${DB_HOST:-db}:${DB_PORT:-3306}..."
    max_tries=30
    count=0
    until php -r "try { new PDO('mysql:host='.(getenv('DB_HOST')?:'db').';port='.(getenv('DB_PORT')?:3306).';dbname='.(getenv('DB_DATABASE')?:'pos_apotek'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch(Exception \$e) { exit(1); }" > /dev/null 2>&1; do
        count=$((count+1))
        if [ $count -ge $max_tries ]; then
            echo "Database connection timed out."
            break
        fi
        sleep 2
    done

    echo "Running database migrations and seeds..."
    php artisan migrate --force --seed || true

    echo "Running production optimizations..."
    php artisan package:discover --ansi
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan storage:link --force || true
fi

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "Starting PHP-FPM..."
exec "$@"

