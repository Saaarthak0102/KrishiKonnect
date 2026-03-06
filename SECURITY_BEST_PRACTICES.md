# KrishiKonnect Security Best Practices Guide
**For Development Team | Updated: March 6, 2026**

---

## 🛡️ Core Security Principles for This Project

### 1. SECRETS MANAGEMENT

#### ✅ DO:
```typescript
// ✅ Correct: Use environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

if (!apiKey) {
  throw new Error('Missing Firebase API key')
}
```

#### ❌ DON'T:
```javascript
// ❌ Wrong: Hardcode secrets
const apiKey = 'AIzaSyBTvv12cHn2DeoK9yObIVzvhK4mIt9B0Dg'

// ❌ Wrong: Store in comments
// API_KEY=xyz123

// ❌ Wrong: Log sensitive data
console.log('API Key:', apiKey)
```

### 2. AUTHENTICATION & AUTHORIZATION

#### Firebase Auth Best Practices:
```typescript
// ✅ Verify user is authenticated
if (!request.auth) {
  throw new Error('User must be authenticated')
}

// ✅ Link operations to user ID
const userRef = doc(db, 'users', request.auth.uid)
await setDoc(userRef, {
  // User data
}, { merge: true })
```

#### Firestore Rules:
```firestore
// ✅ Always check authentication AND ownership
allow write: if request.auth != null 
             && request.auth.uid == request.resource.data.userId;

// ❌ Never allow unconditional writes
allow write: if true;  // DANGEROUS!
```

---

## 🔒 FIRESTORE SECURITY CHECKLIST

Before creating new collections, ensure security rules exist:

### Pattern for User-Owned Collections:
```firestore
match /collections/{docId} {
  // Only authenticated users can read
  allow read: if request.auth != null;
  
  // Only owner can create
  allow create: if request.auth != null 
                && request.auth.uid == request.resource.data.userId;
  
  // Only owner can update
  allow update: if request.auth != null 
                && request.auth.uid == resource.data.userId;
  
  // Only owner can delete
  allow delete: if request.auth != null 
                && request.auth.uid == resource.data.userId;
}
```

### Add Rules to Firestore Rules File:
1. Edit `firestore.rules`
2. Deploy with `firebase deploy --only firestore:rules`
3. Test in Firestore Emulator: `firebase emulators:start`

---

## 🚫 SECURITY ANTI-PATTERNS

### 1. Client-Side Only Validation
```typescript
// ❌ WRONG: Trusting client validation alone
const handleBooking = (quantity: string) => {
  if (Number(quantity) > 0) {
    // Send to server without re-validation
  }
}

// ✅ CORRECT: Validate on both sides
// Client: Quick feedback
if (Number(quantity) <= 0) return setError('Invalid quantity')

// Server/Firestore Rules: Enforce rules
allow write: if request.resource.data.quantity > 0
```

### 2. Storing Sensitive Data in localStorage
```typescript
// ❌ WRONG: Storing auth tokens
localStorage.setItem('auth_token', token)

// ❌ WRONG: Storing passwords
localStorage.setItem('password', userPassword)

// ✅ CORRECT: Firebase handles auth token securely
// Don't manually store tokens - let Firebase SDK manage it

// ✅ CORRECT: Cache non-sensitive data
localStorage.setItem('mandi_prices_cache', JSON.stringify(prices))
```

### 3. Logging Sensitive Information
```typescript
// ❌ WRONG: Logging credentials
console.log('User:', { phoneNumber, otp, authToken })

// ✅ CORRECT: Log safely
console.error('Auth failed:', error.code)  // Not the secret itself
```

---

## 🔐 GIT SECURITY RULES

### File `.gitignore` (Already Correct ✅)
```
# Environment files - CRITICAL
.env
.env.local
.env.development
.env.production
.env*.local

# IDE and temp files
.vscode/
.idea/
*.swp
*.swo
*~

# Build/dependencies
node_modules/
.next/
dist/
build/

# Tracking files (remove these)
replacements.txt
temp_secrets.txt
```

### Before Every Commit:
1. **Review changes:** `git diff --cached`
2. **Check for secrets:** Look for API keys, tokens, passwords
3. **Don't commit** `.env` files
4. **Don't commit** `replacements.txt` or similar tracking files

### Quick Security Check:
```bash
# Search for common secret patterns in staged changes
git diff --cached | grep -iE "password|secret|token|api.?key|apikey"

# If found, unstage and don't commit
git reset <file>
```

---

## 📝 CODE REVIEW CHECKLIST

When reviewing PRs, check:

### Secrets Management
- [ ] No hardcoded API keys
- [ ] All credentials use `process.env`
- [ ] Environment variable validation exists
- [ ] No `.env.local` or similar files committed

### Authentication & Authorization
- [ ] User ID attached to all user-owned data
- [ ] Firestore rules limit access to ownership
- [ ] No privilege escalation possible
- [ ] Admin routes protected properly

### Input Validation
- [ ] User inputs validated before use
- [ ] Array bounds checked
- [ ] String lengths validated
- [ ] Phone numbers/emails format-checked

### No Dangerous Patterns
- [ ] No `dangerouslySetInnerHTML`
- [ ] No `innerHTML` assignments
- [ ] No `eval()` or `Function()` constructor
- [ ] No SQL injection risks (N/A for Firestore, but check external APIs)

### Error Handling
- [ ] Errors caught and handled gracefully
- [ ] No error messages leak sensitive data
- [ ] User sees safe error messages
- [ ] Developers can debug with logs

### Dependencies
- [ ] No new security risks introduced
- [ ] Dependencies updated to safe versions
- [ ] Breaking changes understood

---

## 🧪 SECURITY TESTING

### Before Deployment:
```bash
# 1. Check for exposed secrets
grep -r "AIza" src/
grep -r "REMOVED_SECRET" .
grep -r "password" src/  # Check if password in code

# 2. Test Firestore rules
firebase emulators:start
# Run through security test cases

# 3. Check dependencies
npm audit
npm audit fix

# 4. Build and test
npm run build
npm run lint

# 5. Environment variables
npm start  # Verify all env vars initialized
```

### Test Cases for Security:
```typescript
// Test: Unauthenticated user cannot read user profiles
describe('Firestore Security', () => {
  test('Unauthenticated user cannot read users collection', () => {
    // User should not be able to fetch other user profiles
  })

  test('User can only read own profile', () => {
    // User can read /users/{uid} where uid = their auth.uid
    // Cannot read /users/{other_uid}
  })

  test('User cannot create posts as other users', () => {
    // Posting as userId "abc123" should fail
    // if authenticated user's uid is "xyz789"
  })
})
```

---

## 🚀 DEPLOYMENT SECURITY CHECKLIST

### Before Going Live:

- [ ] **Environment Variables Set**
  - Firebase config in Vercel/hosting
  - Data.gov API key configured
  - No `.env.local` file in repo

- [ ] **Secrets Cleaned from History**
  - No exposed API keys in git log
  - No `replacements.txt` or similar
  - `git filter-branch` run if needed

- [ ] **Firestore Rules Deployed**
  - User collection protected
  - Community questions rules active
  - Transport bookings rules active

- [ ] **API Security**
  - HTTPS enforced (Vercel does this)
  - CORS properly configured
  - Rate limiting considered

- [ ] **Error Handling**
  - No stack traces shown to users
  - Sensitive errors logged server-side only
  - User-friendly error messages

- [ ] **Monitoring Configured**
  - Firebase billing alerts set
  - Firestore usage monitored
  - Error logging enabled

---

## 📱 INCIDENT RESPONSE

### If You Accidentally Commit a Secret:

1. **Immediately** remove from git history:
   ```bash
   git filter-branch --tree-filter 'rm -f .env.local' HEAD
   git push origin --all -f
   ```

2. **Immediately** rotate the exposed secret

3. **Tell your team** to `git clone` fresh

4. **Update environment variables** in all environments

5. **Document** what happened for future prevention

### If You Discover an Exposed Secret:

1. **Don't panic** - modern secrets can be rotated quickly
2. **Disable** the exposed key immediately
3. **Rotate** with a new key
4. **Clean** git history if it's in a repo
5. **Update** environment variables everywhere
6. **Audit** to see if the key was used maliciously

---

## 🔗 SECURITY RESOURCES

### For This Project:
- [NEXT.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Firebase Security Tips](https://firebase.google.com/docs/projects/settings/general-security-rules-tips)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### General Security:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/nodejs-security/)
- [React Security](https://snyk.io/learn/react-security/)

---

## ✨ Questions?

If you have security questions or concerns:
1. Check this guide
2. Review audit report: `SECURITY_AUDIT_REPORT.md`
3. Check remediation guide: `SECURITY_REMEDIATION.md`
4. Contact security team

**Remember:** Security is everyone's responsibility! 🔐

---

*Last Updated: March 6, 2026*  
*Part of Security Audit Initiative*
