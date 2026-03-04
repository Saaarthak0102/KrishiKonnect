import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTvv12cHn2DeoK9yObIVzvhK4mIt9B0Dg",
  authDomain: "krishikonnect-6e3b5.firebaseapp.com",
  projectId: "krishikonnect-6e3b5",
  storageBucket: "krishikonnect-6e3b5.firebasestorage.app",
  messagingSenderId: "408459676622",
  appId: "1:408459676622:web:3f7bf0432041831de7f99f"
}

// Initialize Firebase
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Auth with Recaptcha
export const auth = getAuth(app)
auth.settings.appVerificationDisabledForTesting = false

// Initialize Firestore
export const db = getFirestore(app)

export default app
