// Ref: AND-RF-003, AND-B-004
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNativePlatform } from './platform';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function dataUrlToFile(dataUrl, fileName = 'photo.jpg') {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}

export async function captureImageNative(source = 'camera') {
  if (!isNativePlatform()) {
    return null;
  }

  try {
    const cameraSource = source === 'camera' ? CameraSource.Camera : CameraSource.Photos;
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: cameraSource
    });

    if (!photo || !photo.webPath) {
      throw new Error('No se obtuvo ninguna imagen.');
    }

    const file = await dataUrlToFile(photo.webPath, `nexora_${Date.now()}.${photo.format || 'jpg'}`);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('La imagen excede el tamaño máximo permitido (5 MB).');
    }

    return file;
  } catch (err) {
    if (err.message && (err.message.includes('User cancelled') || err.message.includes('cancelled'))) {
      return null;
    }
    console.error('[CameraHelper] Error capturing image:', err);
    throw err;
  }
}
