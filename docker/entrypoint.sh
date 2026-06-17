#!/bin/sh
set -e

echo "Starting MariaDB..."

# Inisialisasi pertama kali
if [ ! -d "/var/lib/mysql/mysql" ]; then
    mariadb-install-db \
        --user=mysql \
        --datadir=/var/lib/mysql
fi

# Start MariaDB
mysqld \
    --user=mysql \
    --datadir=/var/lib/mysql &

# Tunggu sampai siap
until mariadb-admin ping --silent; do
    echo "Waiting for MariaDB..."
    sleep 2
done

echo "Creating database..."

mariadb -u root <<EOF
CREATE DATABASE IF NOT EXISTS demo_db;
CREATE USER IF NOT EXISTS 'demo_user'@'localhost' IDENTIFIED BY 'demo_password';
GRANT ALL PRIVILEGES ON demo_db.* TO 'demo_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "Running migrations..."

php artisan migrate --force || true

php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "Starting nginx/php-fpm..."

exec /init