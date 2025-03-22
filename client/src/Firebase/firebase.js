import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCmaViYDVXSW2CIJzzKdlMIkuAWskSoPk8",
  authDomain: "students-management-a611c.firebaseapp.com",
  projectId: "students-management-a611c",
  storageBucket: "students-management-a611c.firebasestorage.app",
  messagingSenderId: "889025858163",
  appId: "1:889025858163:web:1c8655e97f2aeb57af7806"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const Auth = getAuth(app)
export default Auth