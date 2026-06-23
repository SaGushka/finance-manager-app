# Dockerfile для мобильного приложения "Финансовый Менеджер"
# Использует Node.js 22 для запуска Expo Metro Bundler

FROM node:22-alpine

# Установка необходимых системных зависимостей
RUN apk add --no-cache \
    git \
    bash \
    curl

# Установка pnpm глобально
RUN npm install -g pnpm@9.12.0

# Создание рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package.json pnpm-lock.yaml ./

# Установка зависимостей
RUN pnpm install --frozen-lockfile

# Копирование всех файлов проекта
COPY . .

# Открытие портов
# 8081 - Metro Bundler (Expo)
# 3000 - Backend API (если используется)
EXPOSE 8081 3000

# Переменные окружения
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV EXPO_USE_METRO_WORKSPACE_ROOT=1
ENV NODE_ENV=development

# Команда запуска
# Запускает Metro Bundler на всех интерфейсах для доступа с хоста
CMD ["pnpm", "run", "dev:metro"]
