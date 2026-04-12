import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCNPqkyriVW9TNRe8B_oyPTyRBnFq4Weos",
  authDomain: "smarttrip-a23d4.firebaseapp.com",
  projectId: "smarttrip-a23d4",
  storageBucket: "smarttrip-a23d4.firebasestorage.app",
  messagingSenderId: "996802873536",
  appId: "1:996802873536:web:d93a005c0666c06ec9c525"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;