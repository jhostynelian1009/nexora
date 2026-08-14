// Ref: AND-RF-004, AND-B-005
import { App } from '@capacitor/app';
import { isNativePlatform } from './platform';

const handlersStack = [];

/**
 * Registers a back button handler with priority.
 * Priority order:
 * 100: Lightbox
 * 90: Modals
 * 80: Notifications drawer/panel
 * 70: Search modal/drawer
 * 60: Active chat drawer
 */
export const registerBackButtonHandler = (handler, priority = 10) => {
  const item = { handler, priority, id: Symbol('back_handler') };
  handlersStack.push(item);
  handlersStack.sort((a, b) => b.priority - a.priority);

  return () => {
    const index = handlersStack.findIndex(h => h.id === item.id);
    if (index !== -1) {
      handlersStack.splice(index, 1);
    }
  };
};

let listenerInitialized = false;

export const initBackButtonListener = () => {
  if (!isNativePlatform() || listenerInitialized) return;
  listenerInitialized = true;

  App.addListener('backButton', (event) => {
    for (const item of handlersStack) {
      try {
        const handled = item.handler();
        if (handled) {
          return;
        }
      } catch (err) {
        console.error('[BackButton] Error in handler:', err);
      }
    }

    if (event && event.canGoBack && window.history.length > 1) {
      window.history.back();
    } else {
      App.minimizeApp();
    }
  });
};
