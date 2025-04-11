// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js'

//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyC4TNMeTZcs36TXvrpWKDQ30X6teBvx_w4',
  authDomain: 'fir-auth-a9cfa.firebaseapp.com',
  projectId: 'fir-auth-a9cfa' ,
  storageBucket: 'fir-auth-a9cfa.firebasestorage.app',
  messagingSenderId: '794778571204',
  appId: '1:794778571204:web:7c1e95e57d9566a9839491',
  measurementId: 'G-KDTYLE4946'
};

// // Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile}