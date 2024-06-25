// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBogmKPM6JyV7l5_Ar8rrZ9aR03Rt-pmyM",
  authDomain: "daring-chess-406421.firebaseapp.com",
  projectId: "daring-chess-406421",
  storageBucket: "daring-chess-406421.appspot.com",
  messagingSenderId: "243977548824",
  appId: "1:243977548824:web:6bf3a18523dbfb66c3bf6d",
  measurementId: "G-1ZF71FS14T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
