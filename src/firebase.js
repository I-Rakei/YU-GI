// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAmf83EeDIp_FY-zOSzrwnMxKYHFVBKa24",
  authDomain: "yu-gi-4a439.firebaseapp.com",
  projectId: "yu-gi-4a439",
  storageBucket: "yu-gi-4a439.appspot.com",
  messagingSenderId: "939187531841",
  appId: "1:939187531841:web:f5c57123d26edea81596c0",
  measurementId: "G-B256R621WE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
