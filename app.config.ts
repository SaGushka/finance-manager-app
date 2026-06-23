import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

/**
 * Expo App Configuration
 * 
 * This configuration defines the app's metadata, permissions, plugins, and platform-specific settings.
 * For more information, see: https://docs.expo.dev/workflow/configuration/
 */

// ============================================================================
// BUNDLE ID CONFIGURATION
// ============================================================================

const rawBundleId = "space.financeapp.finance.manager.app.t20260126101826";

/**
 * Normalize bundle ID to meet platform requirements:
 * - iOS: Reverse domain notation (com.company.app)
 * - Android: Must be lowercase, each segment must start with a letter
 */
const bundleId = rawBundleId
  .replace(/[-_]/g, ".") // Replace hyphens/underscores with dots
  .replace(/[^a-zA-Z0-9.]/g, "") // Remove invalid chars
  .replace(/\.+/g, ".") // Collapse consecutive dots
  .replace(/^\.+|\.+$/g, "") // Trim leading/trailing dots
  .toLowerCase()
  .split(".")
  .map((segment) => {
    // Android requires each segment to start with a letter
    return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
  })
  .join(".") || "space.financeapp.app";

// Extract timestamp for deep linking scheme
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const deepLinkScheme = `financeapp${timestamp}`;

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

const env = {
  // App branding
  appName: "Финансовый Менеджер",
  appSlug: "finance-manager-app",
  appVersion: "1.0.0",
  buildNumber: "1",
  
  // Branding URLs - using local assets
  logoUrl: "",
  
  // Platform identifiers
  scheme: deepLinkScheme,
  iosBundleId: bundleId,
  androidPackage: bundleId,
  
  // Platform versions
  iosMinimumVersion: "15.1",
  androidMinSdkVersion: 24,
  androidTargetSdkVersion: 34,
};

// ============================================================================
// EXPO CONFIGURATION
// ============================================================================

const config: ExpoConfig = {
  // Basic app info
  name: env.appName,
  slug: env.appSlug,
  version: env.appVersion,
  description: "Финансовый менеджер для управления доходами и расходами с аналитикой и прогнозированием",
  
  // UI and orientation
  orientation: "portrait",
  userInterfaceStyle: "automatic", // Automatically switch between light/dark mode
  
  // Icons and branding
  icon: "./assets/images/icon.png",
  backgroundColor: "#ffffff",
  
  // Deep linking
  scheme: env.scheme,
  
  // New architecture
  newArchEnabled: true,
  
  // ========================================================================
  // iOS CONFIGURATION
  // ========================================================================
  ios: {
    // Bundle identifier
    bundleIdentifier: env.iosBundleId,
    
    // Tablet support
    supportsTablet: true,
    
    // Info.plist configuration
    infoPlist: {
      // Encryption declaration
      ITSAppUsesNonExemptEncryption: false,
      
      // App permissions descriptions
      NSCameraUsageDescription: "Приложение использует камеру для сканирования квитанций",
      NSPhotoLibraryUsageDescription: "Приложение использует фотогалерею для загрузки изображений",
      NSMicrophoneUsageDescription: "Приложение использует микрофон для голосовых заметок",
      
      // Status bar
      UIStatusBarStyle: "auto",
      UIViewControllerBasedStatusBarAppearance: false,
      
      // Background modes (if needed in future)
      UIBackgroundModes: ["fetch", "remote-notification"],
    },
    
    // Entitlements
    entitlements: {
      "aps-environment": "production",
    },
  },
  
  // ========================================================================
  // ANDROID CONFIGURATION
  // ========================================================================
  android: {
    // Package name
    package: env.androidPackage,
    
    // Adaptive icon
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    
    // UI configuration
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    
    // Permissions
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.RECORD_AUDIO",
    ],
    
    // Deep linking
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  
  // ========================================================================
  // WEB CONFIGURATION
  // ========================================================================
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
    
    // Meta tags for SEO
    meta: {
      description: "Финансовый менеджер для управления доходами и расходами",
      keywords: "финансы, менеджер, доход, расход, бюджет",
      author: "Arvestin",
    },
  },
  
  // ========================================================================
  // PLUGINS
  // ========================================================================
  plugins: [
    // Router
    "expo-router",
    
    // Audio support
    [
      "expo-audio",
      {
        microphonePermission: "Приложение использует микрофон для голосовых заметок",
      },
    ],
    
    // Video support
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    
    // Splash screen
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
          image: "./assets/images/splash-icon.png",
        },
      },
    ],
    
    // Build properties
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: env.androidMinSdkVersion,
          targetSdkVersion: env.androidTargetSdkVersion,
          compileSdkVersion: env.androidTargetSdkVersion,
          usesCleartextTraffic: false,
        },
      },
    ],
  ],
  
  // ========================================================================
  // EXPERIMENTS & FEATURES
  // ========================================================================
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  
  // ========================================================================
  // EXTRA CONFIGURATION (for custom build scripts)
  // ========================================================================
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID || "default-project-id",
    },
  },
};

export default config;
