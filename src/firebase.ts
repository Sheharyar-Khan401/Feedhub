import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyACZC_AHPT4MW01tP0MVDSlVrniiIZmBDg',
  authDomain: 'feedhub-new.firebaseapp.com',
  projectId: 'feedhub-new',
  storageBucket: 'feedhub-new.firebasestorage.app',
  messagingSenderId: '171660731317',
  appId: '1:171660731317:web:244cf06188a99fbab46ffc',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
