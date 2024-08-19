
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDp7-LxN3DxNlGLEfg0eYqgZO0rDaK5vow",
  authDomain: "reactchatapp-53928.firebaseapp.com",
  projectId: "reactchatapp-53928",
  storageBucket: "reactchatapp-53928.appspot.com",
  messagingSenderId: "249886441603",
  appId: "1:249886441603:web:0535838b46dbfeda265bb6"
};


const app = initializeApp(firebaseConfig);

export const auth=getAuth()
export const db=getFirestore()
export const storage=getStorage()