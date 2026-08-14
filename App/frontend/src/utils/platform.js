// Ref: AND-RF-008, AND-B-003
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export const isNativePlatform = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const getPlatform = () => {
  try {
    return Capacitor.getPlatform();
  } catch {
    return 'web';
  }
};

export const isAndroid = () => {
  return getPlatform() === 'android';
};

export const setupAppLifecycle = ({ onResume, onPause }) => {
  if (!isNativePlatform()) return () => {};

  const resumeListener = App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      if (onResume) onResume();
    } else {
      if (onPause) onPause();
    }
  });

  return () => {
    resumeListener.then(l => {
      if (l && typeof l.remove === 'function') {
        l.remove();
      }
    });
  };
};
