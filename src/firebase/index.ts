'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const isAlreadyInitialized = getApps().length > 0;
  const app = isAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);
  
  const db = isAlreadyInitialized 
    ? getFirestore(app) 
    : initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
      
  const auth = getAuth(app);
  
  let messaging = null;
  if (typeof window !== 'undefined') {
    isMessagingSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
    });
  }

  return { app, db, auth, getMessaging: () => messaging };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
