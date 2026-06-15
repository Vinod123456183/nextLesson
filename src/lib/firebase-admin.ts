/**
 * Firebase Admin SDK — server-side only.
 * Never import this in client components or pages marked 'use client'.
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdminConfig } from './env';

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId:   firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey:  firebaseAdminConfig.privateKey,
    }),
  });
}

const adminApp    = initAdmin();
export const adminDb   = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
