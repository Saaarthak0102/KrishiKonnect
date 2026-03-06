# KrishiKonnect Security Audit Report
**Date:** March 6, 2026  
**Scope:** Full codebase analysis - Next.js + Firebase + Data.gov API + Gemini AI

---

## ⚠️ CRITICAL SECURITY ISSUES

### 1. **Exposed API Keys in Git Repository** 🔴 CRITICAL
**Severity:** CRITICAL | **Status:** REQUIRES IMMEDIATE ACTION

**Issue:** The `.env.local` file containing **real, production Firebase API keys and Data.gov API key** is committed to the git repository.

**Location:** `d:\KrishiKonnect\.env.local`

**Exposed Credentials:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBTvv12cHn2DeoK9yObIVzvhK4mIt9B0Dg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=krishikonnect-6e3b5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=krishikonnect-6e3b5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=krishikonnect-6e3b5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=408459676622
NEXT_PUBLIC_FIREBASE_APP_ID=1:408459676622:web:3f7bf0432041831de7f99f
NEXT_PUBLIC_DATA_GOV_API_KEY=579b464db66ec23bdd000001e2f8fdd6e6d7a3d7403f38f
```

**Why This is Critical:**
- Anyone with access to the repository can use these credentials
- Firebase API keys appear safe (public by design), BUT:
  - The Data.gov API key is **private** and should never be exposed
  - Potential for abuse, rate-limiting, or service disruption
  - Reveals Firebase project ID which could enable targeted attacks
- Git history permanently contains these credentials (visible in commit history)

**Immediate Actions Required:**
1. **Rotate all credentials immediately:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Regenerate API keys
   - Invalidate old Data.gov API key
   
2. **Remove from Git history:**
   ```bash
   # Option A: Using git filter (recommended for public repos)
   git filter-branch --tree-filter 'rm -f .env.local' -- --all
   git push origin --all -f
   
   # Option B: If private repo, just remove and recommit
   git rm .env.local
   git commit -m "security: remove exposed credentials from repository"
   git push
   ```

3. **Verify `.gitignore` properly excludes env files:**
   ```
   .env
   .env.local
   .env.development
   .env.production
   .env*.local
   ```
   ✅ This is already correct in `.gitignore` - the problem is the file was added before it was ignored.

4. **Use `.env.local.example` for documentation:**
   ✅ Already implemented correctly with placeholders.

---

### 2. **Missing Firestore Security Rules for Users Collection** 🔴 CRITICAL
**Severity:** CRITICAL | **Status:** NEEDS IMPLEMENTATION

**Issue:** The `firestore.rules` file lacks security rules for the `users` collection, which stores sensitive farmer profile data and `starredCrops` field.

**Current Rules Coverage:**
- ✅ `community_feed` - Protected
- ✅ `community_questions` - Properly secured with user ownership checks
- ❌ `users` - **NO RULES DEFINED** (defaults to deny, but should be explicit)
- ❌ `users/{uid}/transportBookings` - **NO RULES DEFINED**

**Vulnerabilities:**
- Without explicit rules, Firebase defaults to deny-all, but this is bad practice
- Should explicitly allow users to read/write only their own data

**Fix Required:**

Add to `firestore.rules`:
```firestore
match /users/{userId} {
  // Only authenticated users can read their own profile
  allow read: if request.auth != null && request.auth.uid == userId;
  
  // Only authenticated users can write their own profile
  allow write: if request.auth != null && request.auth.uid == userId;
  
  // Transport bookings subcollection
  match /transportBookings/{bookingId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if request.auth != null && request.auth.uid == userId;
  }
}

// Starred crops - stored in users/{uid}/starredCrops array
// (Above user rules cover this, but can be more specific)
```

---

### 3. **Secrets in Temporary Files** 🔴 CRITICAL
**Severity:** CRITICAL | **Status:** REQUIRES CLEANUP

**Issue:** File `replacements.txt` exists in repository root containing what appears to be a removed/redacted Data.gov API key:
```
579b464db66ec23bdd000001e2f8fdd6e6d7a3d7403f38f==REMOVED_SECRET
```

**Problem:**
- This file should not exist in the repository
- Even though marked as "REMOVED_SECRET", the actual key value is visible
- Such temporary files indicate incomplete credential removal

**Action:**
```bash
# Remove the file
rm replacements.txt
git add replacements.txt
git commit -m "security: remove temporary replacements file"
git push
```

---

## 🟡 MEDIUM RISK ISSUES

### 4. **Test Credentials Hardcoded in Source Code**
**Severity:** MEDIUM | **Status:** ACCEPTABLE FOR DEVELOPMENT, MUST BE REMOVED FOR PRODUCTION

**Location:** [app/login/page.tsx](app/login/page.tsx#L13-L21), lines 13-21

**Issue:**
```javascript
Test Phone Number: +919876543210
Test OTP Code: 123456
```

**Risk:**
- Acceptable for development, but these should not be in production
- Currently displayed to users in the UI (lines 276-277)

**Recommendation:**
```javascript
// Add environment variable check
if (process.env.NODE_ENV === 'development') {
  // Show test credentials only in development
} else {
  // Hide test credentials in production
}
```

---

### 5. **Firestore Read Operations Unrestricted**
**Severity:** MEDIUM | **Status:** ACCEPTABLE BUT REVIEW

**Issue:** Community questions and replies allow `read: if true` (public read access)

**Current Rules:**
```firestore
match /community_questions/{questionId} {
  allow read: if true;  // Public read
  allow create: if request.auth != null ...
  
  match /replies/{replyId} {
    allow read: if true;  // Public read
  }
}
```

**Assessment:**
- ✅ **Acceptable** for a community forum - public visibility encourages participation
- ⚠️ **Watch for abuse** - no rate limiting on read operations
- Consider implementing private discussions if needed in future

---

### 6. **No Input Validation on Image URLs**
**Severity:** MEDIUM | **Status:** ACCEPTABLE WITH MONITORING

**Issue:** Image URLs from community questions/replies displayed without validation

**Location:** 
- [components/community/QuestionCard.tsx](components/community/QuestionCard.tsx#L65-L70)
- [components/community/ThreadView.tsx](components/community/ThreadView.tsx#L36-L42)

**Code:**
```jsx
{image && (
  <img 
    src={image}  // No validation on URL
    alt="Question image" 
  />
)}
```

**Assessment:**
- ✅ **No XSS risk** - `src` attribute is auto-escaped in React
- ⚠️ **Risk:** Malicious users could link to external sources, breaking images or phishing
- Could add validation:
```typescript
const isValidImageUrl = (url: string) => {
  try {
    const validProtocol = url.startsWith('https://') || url.startsWith('data:');
    return validProtocol && url.length < 2048;
  } catch {
    return false;
  }
};

// Only render if valid
{image && isValidImageUrl(image) && <img src={image} alt="..." />}
```

---

### 7. **localStorage Usage Without Encryption**
**Severity:** MEDIUM | **Status:** ACCEPTABLE FOR NON-SENSITIVE DATA

**Issue:** Mandi prices and transport bookings stored in unencrypted localStorage

**Locations:**
- [lib/mandiService.ts](lib/mandiService.ts#L201-L214) - Mandi prices
- [lib/auth.ts](lib/auth.ts#L113) - Farmer profile
- [context/AuthContext.tsx](context/AuthContext.tsx#L61-L75)

**Assessment:**
- ✅ **Acceptable** - localStorage data is non-sensitive (public market prices, booking records)
- ✅ **Good practice** - Cached data improves UX
- ⚠️ **Warning:** If you ever store sensitive data (passwords, tokens), use secure methods:
  ```typescript
  // ✅ Correct for sensitive data
  sessionStorage.setItem(key, encryptedValue);
  
  // ❌ Never do this
  localStorage.setItem('password', password);
  localStorage.setItem('auth_token', token);
  ```

**Current Usage Assessment:** ✅ Safe - only public data is cached

---

## 🟢 POSITIVE SECURITY PRACTICES IMPLEMENTED

### Environment Variable Validation ✅
**Files:** [lib/firebase.ts](lib/firebase.ts#L24-L32), [lib/mandiService.ts](lib/mandiService.ts#L52-L58)

Both files properly validate required environment variables at startup:
```typescript
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ...`);
}

if (!DATA_GOV_API_KEY) {
  throw new Error('Missing required environment variable: ...');
}
```

✅ **Best Practice:** Application fails fast if env vars are missing, preventing silent failures.

---

### Firestore Security Rules for Community ✅
**File:** [firestore.rules](firestore.rules)

Proper implementation:
- User ownership checks: `request.auth.uid == request.resource.data.userId`
- Prevent privilege escalation
- Helper functions to validate data mutations
- Only authenticated users can create content

```firestore
allow create: if request.auth != null 
              && request.auth.uid == request.resource.data.userId;
```

✅ **Best Practice:** Prevents users from creating posts as other users.

---

### No Dangerous DOM Manipulation ✅
**Result:** No instances of:
- ❌ `dangerouslySetInnerHTML`
- ❌ `innerHTML`
- ❌ `eval()`
- ❌ `Function()` constructor

All user input is properly escaped through React's standard rendering.

---

### Input Validation ✅
**File:** [app/login/page.tsx](app/login/page.tsx#L120-L128)

```typescript
const cleanPhone = phoneNumber.replace(/\D/g, '');
if (cleanPhone.length < 10) {
  setError('Please enter a valid 10-digit phone number');
  return;
}
```

✅ **Best Practice:** Validates phone number length before sending to Firebase.

---

### Secure API Key Storage ✅
**Files:** [lib/firebase.ts](lib/firebase.ts), [lib/mandiService.ts](lib/mandiService.ts)

All API keys use `process.env` variables:
```typescript
const DATA_GOV_API_KEY = process.env.NEXT_PUBLIC_DATA_GOV_API_KEY!
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  // ...
}
```

✅ **Best Practice:** Secrets never hardcoded in source.

---

### Error Handling Without Info Leakage ✅
Console errors use proper messages:
```typescript
console.error('Error fetching farmer profile:', error)  // Safe
// NOT: console.error('API Key: ' + apiKey);  // ❌ Dangerous
```

✅ **Best Practice:** Errors logged without exposing credentials.

---

## 📦 DEPENDENCY SECURITY ANALYSIS

**Package.json Review:**

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| firebase | ^10.7.1 | ✅ Current | Latest major version, well-maintained |
| next | ^16.1.6 | ⚠️ Recent | Check npm audit regularly |
| react | ^18.2.0 | ✅ Current | Latest LTS |
| recharts | ^2.10.3 | ⚠️ Review | No known critical vulnerabilities |
| framer-motion | ^11.0.3 | ✅ Current | Safe for animations |
| tailwindcss | ^3.4.1 | ✅ Current | No security issues |
| typescript | ^5.3.3 | ✅ Current | Latest |

**Note:** Run `npm audit` regularly to check for new vulnerabilities:
```bash
npm audit
npm audit fix  # For non-breaking fixes
```

---

## 🔧 PRODUCTION SECURITY CHECKLIST

### Before Deploying to Production:

- [ ] **Remove `.env.local` file** - Only use Vercel/hosting environment variables
- [ ] **Add Firestore security rules** for `users` collection
- [ ] **Remove test credentials** from login page (or gate behind `NODE_ENV === 'development'`)
- [ ] **Rotate all API keys** (Firebase & Data.gov)
- [ ] **Verify `.gitignore`** excludes `.env*`
- [ ] **Clean git history** of exposed credentials using `git filter-branch`
- [ ] **Enable Firebase Security Rules enforcement** in console
- [ ] **Set up Firebase backup/recovery** procedures
- [ ] **Enable audit logging** for Firestore
- [ ] **Use HTTPS only** (Vercel does this automatically)
- [ ] **Add CORS headers** if calling external APIs
- [ ] **Implement rate limiting** on Firestore operations
- [ ] **Set up monitoring** for unusual Firestore activity

### Environment Variables Setup (Vercel/Production):

Instead of `.env.local`, use platform environment variables:

**Vercel Settings:**
```
NEXT_PUBLIC_FIREBASE_API_KEY     = (value from Firebase)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = (value from Firebase)
NEXT_PUBLIC_FIREBASE_PROJECT_ID  = (value from Firebase)
... (other Firebase vars)
NEXT_PUBLIC_DATA_GOV_API_KEY     = (new API key)
```

**Recommended:** Use different API keys for development and production.

---

## 🎯 SUMMARY

### Severity Breakdown:
- **🔴 CRITICAL:** 3 issues
  1. Exposed API keys in `.env.local`
  2. Missing Firestore security rules for users
  3. Secrets in `replacements.txt`

- **🟡 MEDIUM:** 4 issues
  1. Test credentials hardcoded
  2. Public read access to community (acceptable, but review)
  3. No image URL validation
  4. localStorage without encryption (acceptable for non-sensitive)

- **🟢 POSITIVE:** 6 security practices already implemented

---

## 📋 OVERALL ASSESSMENT

**Current Status:** ⚠️ **NOT PRODUCTION-READY** (due to exposed credentials)

**After Fixes:** ✅ **CAN BE PRODUCTION-READY** (with above improvements)

The codebase demonstrates **good security fundamentals** with:
- ✅ Proper environment variable handling
- ✅ Strong Firestore security rules (where defined)
- ✅ No XSS vulnerabilities
- ✅ Input validation
- ✅ Secure API key storage pattern

**Main issues** are related to **operational security** (exposed credentials in repo) rather than code vulnerabilities.

**Recommended Timeline:**
1. **Immediate (Today):** Rotate API keys, clean git history
2. **This week:** Add Firestore rules, remove test credentials
3. **Before deployment:** Complete production checklist

---

## 📞 NEXT STEPS

1. **Remove exposed credentials** (see Critical Issue #1 remediation)
2. **Add Firestore security rules** (see Critical Issue #2)
3. **Clean up temporary files** (see Critical Issue #3)
4. **Test thoroughly** with new credentials
5. **Document secrets management** for team

---

*Generated: March 6, 2026*  
*Auditor: Security Audit System*  
*Classification: Internal Review*
