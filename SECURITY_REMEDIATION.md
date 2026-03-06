# SECURITY REMEDIATION GUIDE
**Priority:** CRITICAL - Execute immediately  
**Updated:** March 6, 2026

---

## 🚨 CRITICAL ACTION ITEMS (Do These First)

### ACTION 1: Rotate All Exposed API Keys

**⏱️ Estimated Time:** 5-10 minutes  
**Risk Level:** CRITICAL

**Step-by-Step:**

#### Step 1a: Invalidate Firebase API Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **krishikonnect-6e3b5**
3. Navigate to **Project Settings** (⚙️ icon)
4. Go to **Service Accounts** tab
5. Click "Generate New Private Key" (this invalidates old keys)
6. Download new JSON file
7. Copy the new credentials

#### Step 1b: Get New Data.gov API Key
1. Go to [Data.gov API Dashboard](https://data.gov.in/api-user)
2. Invalidate/disable old key: `REDACTED_API_KEY`
3. Generate new API key
4. Copy the new key

#### Step 1c: Update Environment Variables
1. In your local `.env.local` file, update:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=<NEW_KEY_FROM_STEP_1a>
   NEXT_PUBLIC_DATA_GOV_API_KEY=<NEW_KEY_FROM_STEP_1b>
   ```

2. **IF USING VERCEL:** Update in Vercel Dashboard:
   - Settings → Environment Variables
   - Edit each variable with new values

---

### ACTION 2: Remove `.env.local` from Git History

**⏱️ Estimated Time:** 5-10 minutes  
**Risk Level:** CRITICAL | **Destructive:** Yes

#### Option A: Remove from History (Recommended for Public Repos)

```bash
# Remove .env.local from entire history
git filter-branch --tree-filter 'rm -f .env.local' HEAD

# Force push to remote (WARNING: This rewrites history!)
git push origin --all -f
git push origin --all

# Notify team members to re-clone the repository
```

**WARNING:** This requires all team members to `git clone` fresh and rebase their branches.

#### Option B: Simple Removal (If Repository is Private)

If the repo is private and you want to be less disruptive:

```bash
# Remove the file
rm .env.local

# Stage removal
git add .env.local

# Commit
git commit -m "security: remove .env.local with exposed credentials"

# Push
git push origin master
```

**Note:** This doesn't remove from history, but prevents further exposure.

---

### ACTION 3: Remove `replacements.txt` File

**⏱️ Estimated Time:** 2 minutes

```bash
# Remove the file
rm replacements.txt

# Remove from git
git add replacements.txt
git commit -m "security: remove temporary replacements file containing secret reference"

# Push
git push origin master
```

---

### ACTION 4: Update Firestore Security Rules

**⏱️ Estimated Time:** 5 minutes

The rules have been updated to include the `users` collection. Deploy them:

#### Method 1: Using Firebase CLI (Recommended)

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

#### Method 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the entire content of your updated `firestore.rules` file
5. Paste it into the rules editor
6. Click **Publish**

**Verify the rules were deployed:**
```bash
firebase firestore:rules:list
```

---

## ✅ VERIFICATION CHECKLIST

After completing the above actions, verify everything is working:

### 1. Test Environment Variables
```bash
# Check local .env.local still exists and has NEW credentials
# (if you chose Option B for git, this file still exists locally)
cat .env.local

# Verify by running the app
npm run dev
# App should start without errors about missing env vars
```

### 2. Test API Connectivity
- [ ] Can fetch mandi prices (Data.gov API working)
- [ ] Can authenticate with Firebase
- [ ] Can read/write to Firestore

### 3. Verify Git History
```bash
# Check that .env.local is not in recent history
git log --oneline -10
git log --all --full-history -- .env.local

# No commit should show .env.local after remediation
# (except if you chose Option B)
```

### 4. Verify Firestore Rules
```bash
# Test rules in Firebase Console Emulator:
firebase emulators:start
```

Test these scenarios:
- [ ] Unauthenticated user cannot read `/users/{uid}`
- [ ] Authenticated user CAN read their own profile `/users/{uid}`
- [ ] Authenticated user CANNOT read other users' profiles `/users/{other_uid}`
- [ ] Community questions are publicly readable (before they were blocked)
- [ ] Only authors can update their own questions

---

## 🔐 PREVENT FUTURE LEAKS

### Updated `.gitignore`

Verify these lines exist in `.gitignore`:
```bash
# local env files
.env
.env.local
.env.development
.env.production
.env*.local
```

✅ Already correct - no changes needed

### Add Git Hooks (Optional but Recommended)

Create `.git/hooks/pre-commit` to prevent committing secrets:

```bash
#!/bin/bash
# Prevent committing .env files
if git diff --cached | grep -E "^[+].*NEXT_PUBLIC_.*=(AIza|[a-f0-9]{32,})" > /dev/null 2>&1; then
  echo "❌ ERROR: Attempting to commit secrets in .env files!"
  echo "Use environment variables instead."
  exit 1
fi
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 📱 TEAM COMMUNICATION

### Message to Share with Team:

> **⚠️ SECURITY INCIDENT: API Keys Exposed**
>
> Our `.env.local` file containing Firebase and Data.gov API keys was accidentally committed to the repository.
>
> **Actions Taken:**
> - All API keys have been rotated
> - Credentials removed from git history
> - Firestore security rules updated
>
> **What You Need To Do:**
> 1. Pull latest changes: `git pull origin master`
> 2. Update your local `.env.local` with new credentials (contact security team)
> 3. Test the application locally
>
> **Never do this:**
> - Don't commit `.env.local`
> - Don't hardcode API keys in source code
> - Don't commit `replacements.txt` or similar tracking files
>
> Contact: [Security Team] with questions

---

## 🧪 TESTING CHECKLIST

After remediation, run these tests:

### Unit Tests
```bash
npm run lint
npm run build
```

### Integration Tests
```bash
# Start dev server
npm run dev

# Test these flows:
1. Login with phone number (Firebase Auth)
2. Create a community question (Firestore write)
3. View community questions (Firestore read)
4. Check mandi prices (Data.gov API)
5. Star a crop (User collection write)
6. View starred crops (User collection read)
```

### Security Tests
```bash
# Verify no secrets in code
grep -r "AIzaSyBTvv12cHn2DeoK9yObIVzvhK4mIt9B0Dg" .
grep -r "REDACTED_API_KEY" .

# Both should return NO RESULTS
```

---

## 📊 IMPLEMENTATION STATUS

| Action | Status | Completed By | Notes |
|--------|--------|--------------|-------|
| Rotate Firebase keys | ⬜ Pending | - | |
| Rotate Data.gov key | ⬜ Pending | - | |
| Remove from git history | ⬜ Pending | - | |
| Delete replacements.txt | ⬜ Pending | - | |
| Update Firestore rules | ✅ Done | Copilot | firestore.rules updated |
| Test new credentials | ⬜ Pending | - | |
| Deploy to production | ⬜ Pending | - | |
| Notify team | ⬜ Pending | - | |

---

## ℹ️ REFERENCE LINKS

- [Firebase Security Best Practices](https://firebase.google.com/docs/database/security)
- [Git Filter Branch Guide](https://git-scm.com/docs/git-filter-branch)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [OWASP: Secrets Management](https://owasp.org/www-project-secrets-management/)

---

## ⚡ QUICK REFERENCE: Secrets to Rotate

| Secret | Current (Exposed) | Status | New Value |
|--------|-------------------|--------|-----------|
| Firebase API Key | `AIzaSyBTvv12cHn2DeoK9yObIVzvhK4mIt9B0Dg` | 🔴 EXPOSED | `[New key - keep secret]` |
| Firebase Auth Domain | `krishikonnect-6e3b5.firebaseapp.com` | ⚠️ Informational | No change needed |
| Firebase Project ID | `krishikonnect-6e3b5` | ⚠️ Informational | No change needed |
| Data.gov API Key | `REDACTED_API_KEY` | 🔴 EXPOSED | `[New key - keep secret]` |

---

*Last Updated: March 6, 2026*  
*Priority: CRITICAL*  
*Status: Action Required*
