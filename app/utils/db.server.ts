import "../../serviceAccountKey.json";
// app/firebase.js
import {
  initializeApp,
  applicationDefault,
  getApps,
  getApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore"; // new
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "review-creator-bc30d.firebaseapp.com",
  projectId: "review-creator-bc30d",
  storageBucket: "review-creator-bc30d.appspot.com",
  messagingSenderId: "466297256882",
  appId: process.env.FIREBASE_APP_ID,
};

let app;
let auth;
let db; // new

if (process.env.NODE_ENV === "development") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth();
  db = getFirestore(); // new
} else {
  app =
    getApps().length === 0
      ? initializeApp({ credential: applicationDefault() })
      : getApp();
  auth = getAuth();
  db = getFirestore(); // new
}
export { app, auth, db }; // new
