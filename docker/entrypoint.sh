#!/bin/sh
set -e

php artisan config:clear

php artisan migrate --force

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec /usr/bin/supervisord -c /etc/supervisord.conf