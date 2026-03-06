/**
 * Centralized Environment Variables Utility
 * 
 * This module provides a single source of truth for accessing environment variables
 * across the application. It ensures consistent variable naming, type safety, and
 * allows for easy addition of new variables without breaking existing code.
 */

// Firebase Configuration (Required)
export const FIREBASE_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
} as const

// Third-party API Keys (Client-side Optional)
// IMPORTANT: Only include NEXT_PUBLIC_* variables here
// Server-side keys like GEMINI_API_KEY should NOT be exposed to the client
export const THIRD_PARTY_APIS = {
  WEATHER_API_KEY: process.env.NEXT_PUBLIC_WEATHER_API_KEY || '',
} as const

// Server-side only variables (not prefixed with NEXT_PUBLIC_)
export const SERVER_ENV = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
} as const

/**
 * Validates that all required Firebase environment variables are set
 * @returns true if all Firebase variables are configured, false otherwise
 */
export function isFirebaseConfigured(): boolean {
  return (
    Boolean(FIREBASE_CONFIG.API_KEY) &&
    Boolean(FIREBASE_CONFIG.AUTH_DOMAIN) &&
    Boolean(FIREBASE_CONFIG.PROJECT_ID) &&
    Boolean(FIREBASE_CONFIG.STORAGE_BUCKET) &&
    Boolean(FIREBASE_CONFIG.MESSAGING_SENDER_ID) &&
    Boolean(FIREBASE_CONFIG.APP_ID)
  )
}

/**
 * Checks if a third-party API is configured
 * @param apiName - The name of the API to check
 * @returns true if the API key is configured, false otherwise
 */
export function isApiConfigured(
  apiName: keyof typeof THIRD_PARTY_APIS
): boolean {
  return Boolean(THIRD_PARTY_APIS[apiName])
}

/**
 * Get all configured API names
 * @returns Array of configured third-party API names
 */
export function getConfiguredApis(): Array<keyof typeof THIRD_PARTY_APIS> {
  return (Object.keys(THIRD_PARTY_APIS) as Array<keyof typeof THIRD_PARTY_APIS>).filter(
    (apiName) => isApiConfigured(apiName)
  )
}

/**
 * Development/logging helper to check environment configuration
 * @param verbose - If true, logs detailed configuration status
 */
export function logEnvironmentStatus(verbose = false): void {
  if (typeof window === 'undefined') {
    // Server-side only
    return
  }

  const firebaseOk = isFirebaseConfigured()
  const configuredApis = getConfiguredApis()

  console.log(
    `🔧 Environment Status: Firebase=${firebaseOk ? '✓' : '✗'}, APIs=${
      configuredApis.length
    } configured`
  )

  if (verbose) {
    console.log('Configured APIs:', configuredApis)
    if (!firebaseOk) {
      const missing = Object.entries(FIREBASE_CONFIG)
        .filter(([_, v]) => !v)
        .map(([k]) => k)
      console.warn('Missing Firebase config:', missing)
    }
  }
}

/**
 * Check if AI API (Gemini) is available
 * Note: This can only be checked on the server side.
 * The client should assume AI API availability and handle errors gracefully.
 * @returns true if GEMINI_API_KEY is configured
 */
export function isAIAPIConfigured(): boolean {
  // This check only works on the server side
  if (typeof window !== 'undefined') {
    return false // Always return false on client side to prevent accidental exposure
  }
  return Boolean(SERVER_ENV.GEMINI_API_KEY)
}
