import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';
import "firebase/compat/auth";
import "firebase/compat/analytics";
//import { initializeApp } from "firebase/app";
//import {getAuth} from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyA59Q2l-yiGCkwFFO0o8-B0rna3-olk-SY",
  authDomain: "chat-app-833ad.firebaseapp.com",
  projectId: "chat-app-833ad",
  storageBucket: "chat-app-833ad.appspot.com",
  messagingSenderId: "818784061869",
  appId: "1:818784061869:web:b003b25443e94144ddf924",
  measurementId: "G-4PBTE5C6VK"
};

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth();
const db = firebase.firestore();



//export const auth = getAuth(app);



export { db, auth };
export default firebase;