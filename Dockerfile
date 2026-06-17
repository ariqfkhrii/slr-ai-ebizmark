# ============================================
# STAGE 1: Build Laravel + Frontend Assets
# ============================================
FROM php:8.4-fpm-alpine AS builder

RUN apk add --no-cache \
    git \
    unzip \
    curl \
    nodejs \
    npm \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    postgresql-dev \
    mysql-client

# PHP Extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        bcmath \
        pdo_mysql \
        pdo_pgsql \
        zip \
        opcache \
        exif \
        mbstring

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy entire project
COPY . .

# Install PHP dependencies
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

# Install Node dependencies
RUN npm ci

# Build frontend assets (Wayfinder akan jalan di sini)
RUN npm run build

# ============================================
# STAGE 2: Production Image
# ============================================
FROM serversideup/php:8.4.11-fpm-nginx-alpine3.21-v3.6.0

USER root

# Install MariaDB
RUN apk add --no-cache \
    mariadb \
    mariadb-client

WORKDIR /var/www/html

COPY --from=builder --chown=www-data:www-data /app ./

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=mysql \
    DB_HOST=127.0.0.1 \
    DB_PORT=3306 \
    DB_DATABASE=demo_db \
    DB_USERNAME=demo_user \
    DB_PASSWORD=demo_password

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]