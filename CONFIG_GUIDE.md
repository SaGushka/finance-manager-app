# Конфигурация Приложения

Этот документ описывает конфигурацию приложения и процесс публикации.

## 📋 Содержание

- [app.config.ts](#appconfigts)
- [eas.json](#easjson)
- [Процесс публикации](#процесс-публикации)
- [Локальный запуск](#локальный-запуск)

---

## app.config.ts

Основной файл конфигурации Expo приложения. Содержит все настройки для iOS, Android и Web.

### Основные разделы

#### 1. **Идентификаторы приложения**

```typescript
const env = {
  appName: "Финансовый Менеджер",           // Название приложения
  appSlug: "finance-manager-app",           // Уникальный идентификатор (для Expo)
  appVersion: "1.0.0",                      // Версия приложения
  buildNumber: "1",                         // Номер сборки
};
```

**Когда изменять:**
- `appName` — когда нужно изменить название в App Store / Google Play
- `appVersion` — при выпуске новой версии (следуйте семантическому версионированию: major.minor.patch)
- `buildNumber` — при каждой новой сборке (incrementally)

#### 2. **iOS конфигурация**

```typescript
ios: {
  bundleIdentifier: "space.financeapp.finance.manager.app.t20260126101826",
  supportsTablet: true,
  infoPlist: {
    ITSAppUsesNonExemptEncryption: false,
    NSCameraUsageDescription: "...",
    NSPhotoLibraryUsageDescription: "...",
  }
}
```

**Важные параметры:**
- `bundleIdentifier` — уникальный идентификатор для App Store (не менять после публикации!)
- `supportsTablet` — поддержка iPad
- `infoPlist` — разрешения и метаданные для iOS

#### 3. **Android конфигурация**

```typescript
android: {
  package: "space.financeapp.finance.manager.app.t20260126101826",
  adaptiveIcon: {
    backgroundColor: "#E6F4FE",
    foregroundImage: "./assets/images/android-icon-foreground.png",
  },
  permissions: [
    "android.permission.CAMERA",
    "android.permission.POST_NOTIFICATIONS",
  ]
}
```

**Важные параметры:**
- `package` — уникальный идентификатор для Google Play (не менять после публикации!)
- `adaptiveIcon` — адаптивная иконка для Android 8+
- `permissions` — требуемые разрешения

#### 4. **Плагины**

Приложение использует следующие плагины:

| Плагин | Назначение |
|--------|-----------|
| `expo-router` | Навигация между экранами |
| `expo-audio` | Запись и воспроизведение аудио |
| `expo-video` | Воспроизведение видео |
| `expo-splash-screen` | Splash screen при загрузке |
| `expo-build-properties` | Настройки сборки |
| `expo-local-authentication` | Биометрическая аутентификация |

---

## eas.json

Конфигурация для EAS Build и EAS Submit (сервис Expo для сборки и публикации).

### Профили сборки

#### 1. **development** — Для разработки

```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "ios": { "resourceClass": "m1-medium" },
    "android": { "buildType": "apk" }
  }
}
```

**Использование:**
```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

**Результат:** APK/IPA для установки на тестовые устройства

#### 2. **preview** — Для тестирования

```json
{
  "preview": {
    "distribution": "internal",
    "ios": { "simulator": true },
    "android": { "buildType": "apk" }
  }
}
```

**Использование:**
```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

**Результат:** Готовая сборка для внутреннего тестирования

#### 3. **production** — Для публикации в App Store / Google Play

```json
{
  "production": {
    "distribution": "store",
    "ios": { "buildType": "archive" },
    "android": { "buildType": "aab" }
  }
}
```

**Использование:**
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

**Результат:** 
- iOS: `.ipa` архив для App Store
- Android: `.aab` (Android App Bundle) для Google Play

---

## Процесс публикации

### Шаг 1: Подготовка

```bash
# Убедитесь, что вы в корне проекта
cd /home/ubuntu/finance-manager-app

# Проверьте версию приложения в app.config.ts
# Обновите appVersion и buildNumber если нужно

# Установите EAS CLI
npm install -g eas-cli

# Авторизуйтесь в Expo
eas login
```

### Шаг 2: Сборка

#### Для iOS:
```bash
# Сборка для App Store
eas build --platform ios --profile production

# Или для тестирования
eas build --platform ios --profile preview
```

#### Для Android:
```bash
# Сборка для Google Play
eas build --platform android --profile production

# Или для тестирования
eas build --platform android --profile preview
```

### Шаг 3: Публикация

#### iOS (App Store):

1. Получите сертификаты:
```bash
eas credentials
```

2. Заполните `eas.json`:
```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_ID",
        "appleId": "YOUR_APPLE_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

3. Отправьте на App Store:
```bash
eas submit --platform ios --profile production
```

#### Android (Google Play):

1. Получите Service Account:
```bash
eas credentials
```

2. Заполните `eas.json`:
```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "@keychain:ANDROID_SERVICE_ACCOUNT",
        "track": "internal"
      }
    }
  }
}
```

3. Отправьте на Google Play:
```bash
eas submit --platform android --profile production
```

---

## Локальный запуск

### Через Docker (рекомендуется)

```bash
# Из корня проекта
docker-compose up

# Приложение будет доступно на http://localhost:3000
```

### Через Expo Go (на мобильном устройстве)

```bash
# Запустите dev-сервер
npm run dev

# Отсканируйте QR-код в Expo Go приложении
# или откройте ссылку exps://...
```

### Через локальный эмулятор

```bash
# iOS (требуется macOS)
npm run ios

# Android
npm run android
```

---

## 🔧 Часто задаваемые вопросы

### Q: Как изменить название приложения?
**A:** Обновите `appName` в `app.config.ts` и пересоберите приложение.

### Q: Как обновить версию приложения?
**A:** Увеличьте `appVersion` (например, с "1.0.0" на "1.0.1") и увеличьте `buildNumber`.

### Q: Как добавить новое разрешение?
**A:** Добавьте разрешение в массив `permissions` в секции `android` или в `infoPlist` для iOS.

### Q: Как изменить иконку приложения?
**A:** Замените файлы в `assets/images/`:
- `icon.png` — основная иконка
- `android-icon-foreground.png` — иконка для Android
- `favicon.png` — иконка для веб-версии

### Q: Как добавить новый плагин?
**A:** Добавьте плагин в массив `plugins` в `app.config.ts` и выполните `npm install`.

---

## 📚 Полезные ссылки

- [Expo Configuration Documentation](https://docs.expo.dev/workflow/configuration/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)

---

## ⚠️ Важные замечания

1. **Bundle ID и Package Name** — Не меняйте после первой публикации, иначе приложение будет считаться новым.

2. **Версионирование** — Всегда увеличивайте версию перед новой сборкой.

3. **Сертификаты** — Сохраняйте сертификаты в безопасном месте, они нужны для обновлений.

4. **Тестирование** — Всегда тестируйте на реальных устройствах перед публикацией.

5. **Разрешения** — Добавляйте только необходимые разрешения, это влияет на доверие пользователей.
