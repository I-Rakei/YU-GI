import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCZaJZoRyBm7vsWXifYxqXFTmnIBW_nwv8",
  authDomain: "yugi-image.firebaseapp.com",
  databaseURL: "https://yugi-image-default-rtdb.firebaseio.com",
  projectId: "yugi-image",
  storageBucket: "yugi-image.appspot.com",
  messagingSenderId: "964777937042",
  appId: "1:964777937042:web:25a459249bcfc70a587e4b",
  measurementId: "G-1369MMY3ZY",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

export default app;
