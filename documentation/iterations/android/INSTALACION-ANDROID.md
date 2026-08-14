# Guía de Instalación y Compilación Nexora Android

Ref: AND-RF-002, AND-RF-005, RNF-008

## 1. Requisitos Previos

- **Node.js**: v18.x o v20.x
- **Java Development Kit (JDK)**: JDK 17 o JDK 21
- **Android Studio / Android SDK**: Android SDK API 34+ con `ANDROID_HOME` configurado.
- **Gradle**: Vía Gradle Wrapper incluido en `App/frontend/android/gradlew.bat`.

## 2. Variables de Entorno

Copiar la plantilla `.env.android.example` a `.env.android` o actualizar `.env`:

```env
VITE_API_URL=https://nexora-api-v2-staging.onrender.com
VITE_WS_URL=wss://nexora-api-v2-staging.onrender.com
VITE_ANDROID_APK_URL=https://github.com/jhostynelian1009/nexora/releases/latest/download/nexora-android.apk
VITE_ANDROID_VERSION=1.0.0
```

> **Nota**: Render staging será el backend estable de pruebas. ngrok es temporal para pruebas locales.

## 3. Pasos de Compilación

1. **Instalar dependencias**:
   ```powershell
   cd App/frontend
   npm install
   ```

2. **Ejecutar conjunto de pruebas**:
   ```powershell
   npm test -- --run
   ```

3. **Compilar build web para Android**:
   ```powershell
   npm run build:android
   ```

4. **Sincronizar assets y plugins nativos con Capacitor**:
   ```powershell
   npx cap sync android
   ```

5. **Compilar APK Debug**:
   ```powershell
   cd android
   .\gradlew.bat assembleDebug
   ```

   Ubicación del APK generado:
   `App/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## 4. Instalación en Dispositivo Físico o Emulador

- **Vía USB con ADB**:
  ```powershell
  adb install -r app/build/outputs/apk/debug/app-debug.apk
  ```
- **Vía Descarga Directa**:
  Acceder desde el navegador web a la pantalla de Login de Nexora y presionar **Descargar APK**.
