import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyDFwB-Yt7ARcMZoPD6-1vI892PXyLEvdcU",
  authDomain: "ultragames-website.firebaseapp.com",
  projectId: "ultragames-website",
  storageBucket: "ultragames-website.firebasestorage.app",
  messagingSenderId: "71123549613",
  appId: "1:71123549613:web:8509e882fc8093a3fab524",
  measurementId: "G-TZYVTF4100"
};

const app = initializeApp(firebaseConfig);

// firestore/lite: REST-only client. Drops WebChannel + long-polling +
// IndexedDB persistence, ~⅔ smaller than the full SDK. We never use
// onSnapshot/persistence/transactions, so feature parity is met.
export const db = getFirestore(app);
