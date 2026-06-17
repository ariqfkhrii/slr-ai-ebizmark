#!/bin/sh
set -e

echo "Starting MariaDB..."

# Init database jika belum ada
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Initializing MariaDB..."
    mariadb-install-db \
        --user=mysql \
        --datadir=/var/lib/mysql
fi

# Socket directory
mkdir -p /run/mysqld
chown mysql:mysql /run/mysqld

# Start MariaDB
mariadbd \
  --user=mysql \
  --datadir=/var/lib/mysql \
  --socket=/run/mysqld/mysqld.sock &

# Wait until ready
until mariadb-admin ping --socket=/run/mysqld/mysqld.sock --silent; do
    echo "Waiting for MariaDB..."
    sleep 2
done

echo "Creating database..."

mariadb --socket=/run/mysqld/mysqld.sock -u root <<EOF
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