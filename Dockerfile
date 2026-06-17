# ============================================
# STAGE 1: Build
# ============================================
FROM php:8.4-fpm-alpine AS builder

RUN apk add --no-cache \
    git \
    unzip \
    curl \
    nodejs \
    npm \
    libzip-dev \
    sqlite-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev

RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    && docker-php-ext-install \
        gd \
        bcmath \
        pdo_mysql \
        pdo_sqlite \
        zip \
        exif \
        mbstring

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction

RUN npm ci
RUN npm run build

# ============================================
# STAGE 2: Runtime
# ============================================
FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    nginx \
    supervisor \
    sqlite \
    sqlite-dev

RUN docker-php-ext-install sqlite3 pdo_sqlite

WORKDIR /var/www/html

COPY --from=builder /app .

RUN mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

RUN touch database/database.sqlite

RUN chmod -R 777 \
    storage \
    bootstrap/cache \
    database \
    /tmp

ENV TMPDIR=/tmp
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/var/www/html/database/database.sqlite

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]