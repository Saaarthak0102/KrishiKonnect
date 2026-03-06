import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// SECURITY NOTE:
// All Firebase API keys must be stored in environment variables.
// Never commit secrets directly into the repository.
// Required environment variables:
// - NEXT_PUBLIC_FIREBASE_API_KEY
// - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
// - NEXT_PUBLIC_FIREBASE_PROJECT_ID
// - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
// - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
// - NEXT_PUBLIC_FIREBASE_APP_ID
// 
// Additional optional variables:
// - NEXT_PUBLIC_WEATHER_API_KEY (for weather data - public API)
// 
// Server-only variables (NOT prefixed with NEXT_PUBLIC_):
// - GEMINI_API_KEY (for AI services - server-side only, never expose to client)

// Validate required environment variables at startup
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]

if (typeof window !== "undefined") {
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  )

  if (missingEnvVars.length > 0) {
    console.warn(
      "⚠️ Missing Firebase environment variables:",
      missingEnvVars.join(", "),
      "\nThe application may not work correctly without these variables.",
      "Please check your .env.local file."
    )
  }
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
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
