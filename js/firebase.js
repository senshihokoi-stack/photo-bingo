// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyBKi2wteenzg-VDa2ltntJLK1H3KXwZ14w",
  authDomain: "photo-bingo-2730.firebaseapp.com",
  projectId: "photo-bingo-2730",
  storageBucket: "photo-bingo-2730.firebasestorage.app",
  messagingSenderId: "540737815814",
  appId: "1:540737815814:web:6ca7316f98971976ed8a87"
};

// 初期化
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);