import admin from "firebase-admin";
import {
  applicationDefault,
  initializeApp as initializeAdminApp,
} from "firebase-admin/app";
import { initializeApp } from "firebase/app";

import "dotenv/config.js";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "review-creator-bc30d.firebaseapp.com",
  projectId: "review-creator-bc30d",
  storageBucket: "review-creator-bc30d.appspot.com",
  messagingSenderId: "466297256882",
  appId: process.env.FIREBASE_APP_ID,
};

if (!admin.apps.length) {
  initializeAdminApp({
    credential: applicationDefault(),
    databaseURL: "https://review-creator.firebaseio.com",
  });
}

const db = admin.firestore();

let Firebase;

if (!Firebase?.apps?.length) {
  Firebase = initializeApp(firebaseConfig);
}

export { db };
