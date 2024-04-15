import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDj24_2mDzrlT4iSvF3Y4YCqVsykHVFigw",
  authDomain: "define24-d7d49.firebaseapp.com",
  projectId: "define24-d7d49",
  storageBucket: "define24-d7d49.appspot.com",
  messagingSenderId: "53269749117",
  appId: "1:53269749117:web:395e4ea37e8e569c684014",
  measurementId: "G-Q1228CLVCM",
  databaseURL: "https://define24-d7d49-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rdb = getDatabase(app);