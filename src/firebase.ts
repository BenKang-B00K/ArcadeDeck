import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

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

// Force long polling. AutoDetect still probes WebChannel first, leaving
// ERR_TIMED_OUT entries in the console (Lighthouse best-practices regression).
// Force-LP skips the probe entirely. Slight latency cost on networks where
// WebChannel would have worked, but eliminates the console noise.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
