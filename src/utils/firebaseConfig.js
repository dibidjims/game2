import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBjpyd7P5RJjQJkya-uNGQ_KvaPXgVs_HU",
  authDomain: "game2group3.firebaseapp.com",
  databaseURL: "https://game2group3-default-rtdb.firebaseio.com",
  projectId: "game2group3",
  storageBucket: "game2group3.firebasestorage.app",
  messagingSenderId: "858255700510",
  appId: "1:858255700510:web:be72254058f33f6051b40f",
  measurementId: "G-3J1K2SDV43"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize Firestore
const firestore = getFirestore(app);

export { database, firestore };
