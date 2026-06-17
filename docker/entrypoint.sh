#!/bin/sh
set -e

# Tunggu database siap
while ! nc -z $DB_HOST $DB_PORT; do sleep 1; done

# Run Laravel migrations
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear cache (untuk development)
php artisan cache:clear

exec "$@"