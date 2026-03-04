# KrishiKonnect - Quick Reference Guide

## 🚀 Getting Started

### 1. Setup Environment
```bash
cd d:\KrishiKonnect
npm install
```

### 2. Add Firebase Credentials
Create `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
```

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📱 User Journey

```
Home Page (/) 
  → "Start Using" button
  → Language Selection (/language)
  → Login with Phone OTP (/login)
  → NEW USER: Setup Profile (/setup)
  → EXISTING USER: Skip to Dashboard
  → Dashboard (/dashboard)
  → Feature Pages (crop-library, mandi, community, transport, ai-advisor)
```

---

## 🔐 Authentication Flow

### Step 1: Language Selection (`/language`)
- **Input:** Language choice (Hindi/English)
- **Action:** Save to `localStorage.app_language`
- **Next:** Redirect to `/login`

### Step 2: Phone Login (`/login`)
- **Input:** Phone number (10 digits)
- **Firebase:** Sends OTP via SMS with reCAPTCHA
- **Input:** 6-digit OTP
- **Firebase:** Verifies OTP
- **Check:** Does farmer profile exist in Firestore?
  - **YES:** → `/dashboard`
  - **NO:** → `/setup`

### Step 3: Setup Profile (`/setup`) - First-Time Users
- **Inputs:**
  - Name
  - Village/City
  - State (dropdown)
  - Primary Crop (dropdown)
- **Action:** Save to Firestore `farmers` collection
- **Document ID:** User's phone number
- **Next:** Redirect to `/dashboard`

### Step 4: Dashboard (`/dashboard`)
- **Protected:** Must be authenticated with profile
- **Shows:** 
  - Welcome message with farmer name
  - Farmer profile details
  - Service feature cards
- **Options:** View services or logout

---

## 📂 Project Structure Overview

```
KrishiKonnect/
├── app/
│   ├── layout.tsx              ← Root layout with providers
│   ├── page.tsx                ← Landing page (public)
│   ├── language/page.tsx       ← Language selection
│   ├── login/page.tsx          ← Phone OTP login
│   ├── setup/page.tsx          ← Profile setup (protected)
│   ├── dashboard/page.tsx      ← Dashboard (protected)
│   ├── crop-library/page.tsx   ← Feature page
│   ├── mandi/page.tsx          ← Feature page
│   ├── community/page.tsx      ← Feature page
│   ├── transport/page.tsx      ← Feature page
│   └── ai-advisor/page.tsx     ← Feature page
│
├── context/
│   └── AuthContext.tsx         ← Global auth state
│
├── lib/
│   ├── firebase.ts             ← Firebase config
│   ├── auth.ts                 ← Auth utilities
│   ├── LanguageContext.tsx     ← Language state
│   └── translations.ts         ← Bilingual strings
│
├── components/
│   ├── AuthProvider.tsx        ← Auth wrapper
│   ├── Navbar.tsx              ← Navigation
│   ├── LanguageSelector.tsx    ← Language picker
│   ├── HeroSection.tsx         ← Landing hero
│   ├── FeatureGrid.tsx         ← Feature cards
│   ├── HowItWorks.tsx          ← Steps guide
│   ├── AIHighlight.tsx         ← AI feature
│   ├── CTASection.tsx          ← Call-to-action
│   ├── Footer.tsx              ← Footer
│   └── CropCard.tsx            ← Crop display
│
├── public/                      ← Static assets
├── data/
│   ├── crops.json              ← Crops database
│   └── mandi.json              ← Mandi data
│
└── [config files]
```

---

## 🔑 Key Features Implemented

### ✅ Global Auth State
- **Hook:** `useAuth()`
- **Returns:** `{ user, farmerProfile, loading, isAuthenticated }`
- **Usage:** `const { user, farmerProfile } = useAuth()`

### ✅ Global Language State
- **Hook:** `useLanguage()`
- **Returns:** `{ lang, changeLang }`
- **Usage:** `const { lang } = useLanguage()`

### ✅ Protected Routes
- Dashboard requires auth + farmer profile
- Setup requires auth only
- Uses auth state to redirect

### ✅ Bilingual Support
- Hindi (हिंदी) and English
- Toggle in navbar
- Persisted in localStorage

### ✅ Firestore Integration
- **Collection:** `farmers`
- **Document ID:** User's phone number
- **Fields:** name, village, state, primaryCrop, phoneNumber, createdAt

---

## 🎨 Design System

| Color | Value | Usage |
|-------|-------|-------|
| Background | #FAF3E0 | Page background |
| Primary | #B85C38 | Buttons, CTAs |
| Heading | #1F3C88 | Titles, headers |
| Agriculture | #7FB069 | Nature/health elements |
| Text | #1D1D1D | Body text |
| Border | #D8CFC0 | Dividers, borders |
| Accent | #F2A541 | Highlights |

---

## 🛠️ Common Tasks

### Add New Protected Page
```tsx
// pages/example/page.tsx
'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ExamplePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    // Your content here
  )
}
```

### Use Auth Context
```tsx
const { user, farmerProfile, isAuthenticated, loading } = useAuth()

if (isAuthenticated) {
  // Show authenticated content
}
```

### Use Language Context
```tsx
const { lang, changeLang } = useLanguage()
const t = translations[lang]

return <h1>{t.homePageTitle}</h1>
```

### Add Translations
Edit `/lib/translations.ts`:
```typescript
export const translations = {
  hi: {
    myKey: 'हिंदी में पाठ',
  },
  en: {
    myKey: 'Text in English',
  }
}
```

---

## 🌍 Deployment

### Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t krishikonnect .
docker run -p 3000:3000 krishikonnect
```

### Traditional Server
```bash
npm run build
npm start
```

---

## 🧪 Testing Flows

### New User Flow
1. Visit homepage
2. Click "Start Using"
3. Select Hindi/English
4. Enter phone number
5. Receive OTP
6. Enter OTP
7. Fill setup form
8. Reach dashboard

### Existing User Flow
1. Visit homepage
2. Click "Start Using"
3. Select language
4. Enter phone number
5. Receive OTP
6. Enter OTP
7. Direct to dashboard (profile already exists)

### Language Toggle
1. Click "EN" or "हिंदी" in navbar
2. All text changes immediately
3. Language persists on reload

---

## 📊 Firestore Structure

### Collection: `farmers`
```javascript
// Document ID: "+919876543210"
{
  phoneNumber: "+919876543210",
  name: "Rajesh Kumar",
  village: "Bhavi",
  state: "Madhya Pradesh",
  primaryCrop: "Wheat",
  createdAt: Timestamp(2026, 3, 4, ...)
}
```

---

## 🔧 Troubleshooting

### Build Fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Auth Not Working
- Check Firebase credentials in `.env.local`
- Verify Phone Auth is enabled in Firebase Console
- Check reCAPTCHA configuration

### Language Not Persisting
- Check localStorage permissions
- Verify `localStorage.getItem('app_language')` returns value

### Profile Not Loading
- Ensure document exists in Firestore under `farmers` collection
- Document ID must match user's phone number
- Check Firestore security rules

---

## 📝 Notes for Developers

1. **Don't commit Firebase credentials** - Use `.env.local` (added to `.gitignore`)
2. **All routes are client components** - Using `'use client'` directive
3. **Auth state syncs automatically** - No manual fetching needed
4. **Language preference persists** - Saved in localStorage
5. **Farmer profile cached** - Check localStorage before Firestore query

---

## 🎯 Next Phases

### Phase 2: API Integration
- Weather API for crop recommendations
- Mandi price APIs
- Transport provider integration
- AI model for advisor

### Phase 3: Advanced Features
- Real-time community chat
- Push notifications
- Offline support
- PWA capabilities

### Phase 4: Production Ready
- Performance optimization
- Analytics
- Advanced security
- Scalability testing

---

**Last Updated:** March 4, 2026
**Status:** ✅ Authentication & Routing Complete - Ready for Phase 2
