# ============================================
# STAGE 1: Build Frontend (React + Inertia + TypeScript)
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy package files untuk caching
COPY package*.json ./
COPY npm-workspace.yaml ./
COPY .npmrc ./

# Install dependencies
RUN npm ci

# Copy semua source frontend
COPY resources/ ./resources/
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./
COPY components.json ./
COPY .prettierrc ./

# Build assets (Vite akan compile TypeScript)
RUN npm run build

# ============================================
# STAGE 2: Build Backend (Laravel)
# ============================================
FROM php:8.2-fpm-alpine AS backend-builder

# Install system dependencies
RUN apk add --no-cache \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    postgresql-dev \
    mysql-client \
    curl \
    nodejs \
    npm

# Install PHP extensions
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

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files dulu untuk caching
COPY composer.json composer.lock ./

# Install PHP dependencies (production only)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Copy seluruh aplikasi
COPY . .

# Copy built frontend assets dari Stage 1
COPY --from=frontend-builder /frontend/public/build ./public/build

# ============================================
# STAGE 3: Final Production Image
# ============================================
FROM serversideup/php:8.4.11-fpm-nginx-alpine3.21-v3.6.0

# Copy application dari builder stage
COPY --from=backend-builder /app /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Copy custom configurations (opsional, sesuaikan path)
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set environment variables untuk Laravel
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr

EXPOSE 8080

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm", "-F"]