# Запуск проекта локально через Docker

Это руководство поможет вам запустить мобильное приложение "Финансовый Менеджер" на вашем компьютере без использования Manus.

## Требования

Перед началом убедитесь, что у вас установлено:

1. **Docker Desktop** (версия 20.10 или новее)
   - Windows/Mac: [Скачать Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: [Установить Docker Engine](https://docs.docker.com/engine/install/)

2. **Docker Compose** (обычно входит в Docker Desktop)

3. **Expo Go** на телефоне (для тестирования на реальном устройстве)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Быстрый старт

### 1. Клонирование репозитория

```bash
# Если у вас есть доступ к Git репозиторию
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
cd finance-manager-app

# Или скачайте проект через интерфейс Manus (Code → Download)
```

### 2. Запуск через Docker Compose

```bash
# Запуск контейнера (первый раз займёт несколько минут)
docker-compose up

# Или в фоновом режиме
docker-compose up -d
```

### 3. Открытие приложения

После запуска контейнера вы увидите в терминале:

```
Metro waiting on exp://192.168.x.x:11000
```

**Вариант А: На телефоне (рекомендуется)**

1. Откройте приложение **Expo Go** на телефоне
2. Убедитесь, что телефон и компьютер в одной Wi-Fi сети
3. Отсканируйте QR-код из терминала
4. Приложение откроется на телефоне

**Вариант Б: В браузере (для тестирования)**

1. Откройте браузер
2. Перейдите на `http://localhost:11000`
3. Приложение откроется в веб-версии

## Управление контейнером

### Просмотр логов

```bash
# Показать логи в реальном времени
docker-compose logs -f expo

# Показать последние 100 строк
docker-compose logs --tail=100 expo
```

### Остановка контейнера

```bash
# Остановить контейнер
docker-compose stop

# Остановить и удалить контейнер
docker-compose down
```

### Перезапуск после изменений

```bash
# Перезапустить контейнер
docker-compose restart

# Пересобрать образ и запустить (если изменили Dockerfile)
docker-compose up --build
```

## Разработка с Docker

### Hot Reload

Изменения в коде автоматически применяются благодаря volume mapping:
- `app/` - экраны приложения
- `components/` - компоненты UI
- `lib/` - бизнес-логика
- `hooks/` - React хуки
- `types/` - TypeScript типы

Просто редактируйте файлы, и приложение обновится автоматически.

### Установка новых зависимостей

```bash
# Войти в контейнер
docker-compose exec expo sh

# Установить пакет
pnpm add <package-name>

# Выйти из контейнера
exit

# Перезапустить контейнер
docker-compose restart
```

## Структура Docker-конфигурации

```
finance-manager-app/
├── Dockerfile              # Образ с Node.js 22 и Expo
├── docker-compose.yml      # Оркестрация контейнеров
├── .dockerignore          # Исключения при сборке образа
└── DOCKER_SETUP.md        # Эта инструкция
```

## Порты

- **11000** - Metro Bundler (Expo Dev Server)
- **3000** - Backend API (если используется)

## Переменные окружения

Настройки находятся в `docker-compose.yml`:

```yaml
environment:
  - EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0  # Слушать на всех интерфейсах
  - EXPO_USE_METRO_WORKSPACE_ROOT=1       # Использовать корень проекта
  - NODE_ENV=development                   # Режим разработки
```

## Troubleshooting

### Проблема: QR-код не сканируется

**Решение:**
- Убедитесь, что телефон и компьютер в одной Wi-Fi сети
- Отключите VPN на телефоне
- Попробуйте ввести URL вручную в Expo Go: `exp://<IP_КОМПЬЮТЕРА>:11000`

### Проблема: "Cannot connect to Metro"

**Решение:**
```bash
# Очистить кеш и перезапустить
docker-compose down
docker-compose up --build
```

### Проблема: Изменения не применяются

**Решение:**
```bash
# Перезапустить Metro Bundler внутри контейнера
docker-compose exec expo pnpm run dev:metro
```

### Проблема: Порт 11000 уже занят

**Решение:**
```bash
# Найти процесс на порту 11000
# Windows
netstat -ano | findstr :11000

# Mac/Linux
lsof -i :11000

# Убить процесс или изменить порт в docker-compose.yml
```

## Альтернатива: Запуск без Docker

Если вы предпочитаете запускать проект напрямую:

```bash
# Установить зависимости
pnpm install

# Запустить Metro Bundler
pnpm run dev:metro

# В отдельном терминале (если нужен backend)
pnpm run dev:server
```

**Требования:**
- Node.js 22.x
- pnpm 9.12.0

## Дополнительные команды

### Сборка production-версии

```bash
# Веб-версия
docker-compose exec expo pnpm run build

# Android APK (требуется EAS CLI)
docker-compose exec expo npx eas build --platform android

# iOS IPA (требуется Apple Developer Account)
docker-compose exec expo npx eas build --platform ios
```

### Запуск тестов

```bash
# Unit-тесты
docker-compose exec expo pnpm test

# Проверка типов TypeScript
docker-compose exec expo pnpm run check
```

## Публикация приложения

Для публикации в App Store / Google Play:

1. Создайте аккаунт в [Expo Application Services](https://expo.dev/)
2. Установите EAS CLI: `npm install -g eas-cli`
3. Войдите: `eas login`
4. Соберите приложение: `eas build --platform all`
5. Отправьте в магазины: `eas submit`

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `docker-compose logs -f`
2. Перезапустите контейнер: `docker-compose restart`
3. Пересоберите образ: `docker-compose up --build`

---

**Версия:** 1.0  
**Последнее обновление:** 23 июня 2026
