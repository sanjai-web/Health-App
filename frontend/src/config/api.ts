import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

export const PRODUCTION_BACKEND_URL = 'https://health-app-backend-3nzk.onrender.com';

// Helper to automatically detect developer machine IP from Metro bundler or fallback to production URL
export const getDefaultBackendUrl = (): string => {
  if (__DEV__) {
    try {
      // 1. Try expo-constants (highly reliable in Expo Go)
      const manifest = (Constants.expoConfig || Constants.manifest) as any;
      const hostUri = manifest?.hostUri;
      if (hostUri) {
        const ip = hostUri.split(':')[0];
        if (ip) {
          console.log('Automatically detected local backend IP via expo-constants:', ip);
          return `http://${ip}:3000`;
        }
      }
      
      const manifest2 = (Constants.manifest2) as any;
      const debuggerHost = (Constants.manifest as any)?.debuggerHost || manifest2?.extra?.expoGo?.debuggerHost;
      if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        if (ip) {
          console.log('Automatically detected local backend IP via debuggerHost:', ip);
          return `http://${ip}:3000`;
        }
      }
    } catch (e) {
      console.warn('Failed to get IP from expo-constants:', e);
    }

    try {
      // 2. Fallback to NativeModules.SourceCode.scriptURL
      const scriptURL = NativeModules.SourceCode?.scriptURL;
      if (scriptURL) {
        const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
        if (match && match[1]) {
          console.log('Automatically detected local backend IP via scriptURL:', match[1]);
          return `http://${match[1]}:3000`;
        }
      }
    } catch (err) {
      console.warn('Could not automatically determine backend IP via scriptURL:', err);
    }
    return 'http://192.168.1.62:3000'; // Fallback local IP based on Metro config
  }
  return PRODUCTION_BACKEND_URL; // Production URL when built/published
};
