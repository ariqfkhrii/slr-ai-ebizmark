#!/bin/sh
set -e

mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

chmod -R 777 storage
chmod -R 777 bootstrap/cache

php artisan migrate --force

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

exec supervisord -c /etc/supervisord.conf