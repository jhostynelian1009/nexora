// Ref: AND-RF-002, AND-B-003
import { Preferences } from '@capacitor/preferences';
import { isNativePlatform } from '../utils/platform';

const memoryCache = new Map();

export const storage = {
  async getItem(key) {
    if (isNativePlatform()) {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null) {
          memoryCache.set(key, value);
        } else {
          memoryCache.delete(key);
        }
        return value;
      } catch (err) {
        console.warn('[Storage] Error reading from Preferences:', err);
        return memoryCache.get(key) || localStorage.getItem(key);
      }
    }
    return localStorage.getItem(key);
  },

  getItemSync(key) {
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }
    return localStorage.getItem(key);
  },

  async setItem(key, value) {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
    memoryCache.set(key, stringVal);
    if (isNativePlatform()) {
      try {
        await Preferences.set({ key, value: stringVal });
      } catch (err) {
        console.warn('[Storage] Error saving to Preferences:', err);
      }
    }
    localStorage.setItem(key, stringVal);
  },

  async removeItem(key) {
    memoryCache.delete(key);
    if (isNativePlatform()) {
      try {
        await Preferences.remove({ key });
      } catch (err) {
        console.warn('[Storage] Error removing from Preferences:', err);
      }
    }
    localStorage.removeItem(key);
  },

  async clear() {
    memoryCache.clear();
    if (isNativePlatform()) {
      try {
        await Preferences.clear();
      } catch (err) {
        console.warn('[Storage] Error clearing Preferences:', err);
      }
    }
    localStorage.clear();
  },

  async initCache() {
    if (isNativePlatform()) {
      try {
        const tokenRes = await Preferences.get({ key: 'nexora_token' });
        if (tokenRes.value) memoryCache.set('nexora_token', tokenRes.value);

        const userRes = await Preferences.get({ key: 'nexora_user' });
        if (userRes.value) memoryCache.set('nexora_user', userRes.value);
      } catch (err) {
        console.warn('[Storage] Error initializing cache:', err);
      }
    }
  }
};
