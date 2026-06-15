/**
 * Firebase client SDK — used in browser/client components only.
 * Do NOT import this in API routes or server components.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { firebaseClientConfig } from './env';

const app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);

export const db             = getFirestore(app);
export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
