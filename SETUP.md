# KrishiKonnect - Authentication & Setup Guide

## Project Overview

This is a farmer-friendly agricultural platform built with Next.js + Firebase that implements complete authentication and routing workflows using Phone OTP authentication.

## Architecture

### Application Flow

```
User Visits App
    ↓
Language Selection (हिंदी / English)
    ↓
Phone OTP Login
    ↓
Check Farmer Profile
    ├→ Profile Exists → Dashboard
    └→ Profile Missing → Setup Profile → Dashboard
    ↓
Main Dashboard (Protected Route)
```

### File Structure

```
app/
├── page.tsx                    # Root redirector (checks auth status)
├── language/page.tsx           # Language selection page
├── login/page.tsx              # Phone OTP authentication
├── setup/page.tsx              # Farmer profile setup
├── dashboard/page.tsx          # Main dashboard (protected)
└── home/page.tsx               # Marketing landing page

lib/
├── firebase.ts                 # Firebase configuration & initialization
├── auth.ts                     # Authentication utilities & Firestore operations
├── AuthContext.tsx             # Auth state management
└── LanguageContext.tsx         # Language preference management

components/
├── AuthProvider.tsx            # Auth context wrapper
├── HeroSection.tsx             # Landing page hero
├── FeatureCard.tsx             # Feature display cards (non-interactive)
├── Navbar.tsx                  # Navigation with anchor links
└── ... (other components)
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

Firebase is already added to package.json. Install all dependencies:

```bash
npm install firebase
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication:
   - Authentication → Get Started
   - Enable Phone Provider
   - Add your domain to authorize if needed
4. Enable Firestore:
   - Firestore Database → Create Database
   - Start in production mode (set security rules as needed)
5. Get your configuration:
   - Project Settings → General tab
   - Copy the config values

### 3. Set Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### 4. Configure Firestore Rules

Update your Firestore security rules to allow authenticated users to access their data:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /farmers/{phoneNumber} {
      allow read, write: if request.auth != null && request.auth.uid != null;
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Key Features Implemented

### ✅ Authentication Flow
- Phone OTP authentication via Firebase
- Phone number validation (Indian format: +91)
- reCAPTCHA verification
- Session persistence

### ✅ Farmer Profile Management
- First-time user profile creation
- Farmer data stored in Firestore collection `farmers`
- Document ID = phone number
- Fields: name, village, state, primaryCrop, createdAt

### ✅ Language Support
- Hindi (हिंदी) and English (EN)
- Language preference saved in localStorage (`app_language`)
- Context-based state management

### ✅ Protected Routes
- Dashboard access restricted to authenticated users
- Automatic redirect to login if unauthorized
- Profile checking before dashboard access

### ✅ UI/UX
- Responsive design (mobile-first)
- Farmer-friendly interface
- Large buttons for easy interaction
- KrishiKonnect brand colors:
  - Background: #FAF3E0 (Warm Cream)
  - Primary: #B85C38 (Clay)
  - Heading: #1F3C88 (Deep Indigo)
  - Agriculture: #7FB069 (Green)

## Component Details

### AuthProvider (context/AuthContext.tsx)
- Wraps entire application
- Tracks authentication state
- Manages farmer profile data
- Provides `useAuth()` hook

Usage:
```tsx
const { user, farmerProfile, loading, isAuthenticated } = useAuth()
```

### Authentication Utils (lib/auth.ts)
- `sendOTP()` - Send OTP to phone number
- `verifyOTP()` - Verify OTP code
- `checkFarmerProfile()` - Check if profile exists
- `getFarmerProfile()` - Fetch profile data
- `createFarmerProfile()` - Create new profile
- `logout()` - Sign out user

### Language Management
- All text is translatable via `translations.ts`
- `useLanguage()` hook provides language state
- Language selector on all pages

## Firestore Schema

### Collection: `farmers`

Document ID: `phoneNumber` (e.g., "+919876543210")

Fields:
```typescript
{
  name: string              // Farmer's name
  village: string           // Village/City
  state: string            // Indian state
  primaryCrop: string      // Main crop cultivated
  phoneNumber: string      // Phone number
  createdAt: timestamp     // Account creation date
}
```

## Testing the Flow

1. **First Visit**: You'll be redirected to language selection
2. **Language Selection**: Choose Hindi or English
3. **Login**: Enter any Indian phone number (for testing)
4. **OTP**: Enter any 6-digit code (Firebase will simulate in test mode)
5. **Profile Setup**: Fill in farmer details
6. **Dashboard**: Access main app features

## Common Issues & Solutions

### Issue: "Firebase is not initialized"
**Solution**: Check that all environment variables are set in `.env.local`

### Issue: Phone authentication not working
**Solution**: 
- Ensure Phone Authentication is enabled in Firebase Console
- Check that your domain is authorized (Authentication → Settings)
- For testing, you can enable testing mode in Firebase

### Issue: Hydration errors
**Solution**: AuthProvider and LanguageProvider handle hydration. Ensure they wrap the entire application in layout.tsx

### Issue: Routes not working
**Solution**: Clear `.next` folder and rebuild:
```bash
rm -rf .next
npm run build
npm run dev
```

## Environment Variables

All Firebase variables are prefixed with `NEXT_PUBLIC_` so they're accessible in browser code.

⚠️ **Security Note**: 
- These variables are public by design (needed for Firebase client SDK)
- Never expose secret keys
- Use Firebase Security Rules to protect your data
- Consider implementing backend cloud functions for sensitive operations

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Project Settings
4. Deploy

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... add all variables
vercel
```

### Other Platforms

1. Build the project:
   ```bash
   npm run build
   ```

2. Set environment variables in your hosting platform

3. Start the app:
   ```bash
   npm start
   ```

## Next Steps

- [ ] Customize color scheme if needed
- [ ] Add additional farmer profile fields
- [ ] Implement Firestore security rules
- [ ] Set up email notifications
- [ ] Create cloud functions for backend logic
- [ ] Add analytics
- [ ] Implement phone number verification email/SMS

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Check Firestore security rules

---

**Happy Farming! 🌾**
