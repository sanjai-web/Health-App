/**
 * firebase.ts — Single source of truth for Firebase initialization.
 *
 * Rules:
 *  1. This file initializes Firebase exactly ONCE per JS bundle context.
 *  2. `auth` and `db` are exported as pre-initialized singletons.
 *  3. All screens/services must import { auth, db } from here — NEVER call
 *     getAuth(app) or getDatabase(app) locally.
 *
 * This eliminates the "Component auth has not been registered yet" error,
 * which occurs when getAuth() is called in a JS context where initializeAuth()
 * was never executed in that same bundle evaluation.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCBLdEB43paTY-KoElImBaX5NSK9Qlef_U',
  authDomain: 'in-1-health-check.firebaseapp.com',
  databaseURL: 'https://in-1-health-check-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'in-1-health-check',
  storageBucket: 'in-1-health-check.firebasestorage.app',
  appId: '1:805963694011:android:30dcc5640fe9e5e3844e9e',
};

// Initialize app — guard against duplicate registration on Fast Refresh
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth — if already initialized by a previous bundle, getAuth() returns it.
// If not yet initialized (fresh bundle context), initializeAuth registers it.
let auth: any;
try {
  // Try getting the already-initialized auth instance first
  auth = getAuth(app);
} catch {
  // Not yet initialized in this context — register it now with AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize Realtime Database singleton
const db = getDatabase(app);

export { app, auth, db };
