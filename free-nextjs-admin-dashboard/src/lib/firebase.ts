import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey : "AIzaSyAdYlIwdC026h-cCG4yDjdH_6ZW3xBqHI8" , 
    authDomain : "warehousemanagement-405f6.firebaseapp.com" , 
    projectId : "warehousemanagement-405f6" , 
    storageBucket : "warehousemanagement-405f6.firebasestorage.app" , 
    messagingSenderId : "404032166380" , 
    appId : "1:404032166380:web:48bf203be06ddf2d1788c9" , 
    measurementId : "G-9Z3WWJJQDX" 
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);