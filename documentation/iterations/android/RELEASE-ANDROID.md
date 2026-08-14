# Procedimiento de Release y Hash SHA-256 Nexora Android

## 1. Especificaciones de la Release

- **Tag Git**: `android-v1.0.0`
- **Título Release**: `Nexora Android v1.0.0`
- **Nombre de Asset**: `nexora-android.apk`
- **URL Estable de Descarga**: `https://github.com/jhostynelian1009/nexora/releases/latest/download/nexora-android.apk`
- **Compatibilidad Mínima**: Android 8.0+ (API 26+)

## 2. Hash SHA-256 de Verificación

Una vez compilado el APK firmado release, ejecutar el comando PowerShell para calcular el hash SHA-256:

```powershell
Get-FileHash .\nexora-android.apk -Algorithm SHA256
```

## 3. Registro de Firmado y Publicación

1. La firma de la release debe realizarse utilizando una keystore privada almacenada fuera del repositorio.
2. Nunca guardar en el repositorio: `*.keystore`, `*.jks`, `key.properties` o contraseñas de firma.
3. Publicar la Release en GitHub como pública (no draft ni prerelease) para habilitar la descarga directa vía `/releases/latest/download/nexora-android.apk`.
