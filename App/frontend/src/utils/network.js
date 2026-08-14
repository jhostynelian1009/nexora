// Ref: AND-RF-005, AND-B-006
import { Network } from '@capacitor/network';
import { isNativePlatform } from './platform';

export const checkNetworkStatus = async () => {
  if (isNativePlatform()) {
    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch (err) {
      console.warn('[Network] Error checking status:', err);
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }
  }
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

export const setupNetworkListener = (onStatusChange) => {
  if (isNativePlatform()) {
    const listenerPromise = Network.addListener('networkStatusChange', (status) => {
      onStatusChange(status.connected);
    });
    return () => {
      listenerPromise.then(l => {
        if (l && typeof l.remove === 'function') l.remove();
      });
    };
  } else {
    const handleOnline = () => onStatusChange(true);
    const handleOffline = () => onStatusChange(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};
