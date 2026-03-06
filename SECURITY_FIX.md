# Security Fix: API Keys and Secret Management

## Overview

This document outlines the security measures implemented to protect API keys and secrets in the KrishiKonnect project, as well as instructions for removing exposed secrets from Git history.

## ⚠️ Critical Security Alert

Previously, the following credentials were exposed in the repository:

- **Data.gov API Key**: Hardcoded in `lib/mandiService.ts`
- **Firebase Configuration**: Check Git history for exposure

All sensitive credentials have been migrated to environment variables. However, they may still exist in Git history and must be removed.

---

## ✅ Security Measures Implemented

### 1. Environment Variables Configuration

All API keys are now stored in `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_DATA_GOV_API_KEY=your_datagov_key_here
```

### 2. Runtime Validation

The application now validates that all required environment variables are present at startup:

- **firebase.ts**: Validates all 6 Firebase environment variables
- **mandiService.ts**: Validates the Data.gov API key

If any required variable is missing, the application will crash with a clear error message.

### 3. Git Ignore Configuration

The `.gitignore` file now includes comprehensive patterns to prevent accidental commits:

```
.env
.env.local
.env.development
.env.production
.env*.local
```

### 4. Example Configuration File

The `.env.local.example` file provides a template for contributors:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_DATA_GOV_API_KEY=
```

---

## 🔧 Removing Secrets from Git History

### ⚠️ Before You Start

1. Make sure all team members are aware of the history rewrite
2. Create a backup of your repository
3. Alert collaborators to re-clone after the cleanup

### Option 1: Using git-filter-repo (Recommended)

**Installation:**
```bash
# On Windows with Python 3.5+
pip install git-filter-repo
# Or use Homebrew on macOS
brew install git-filter-repo
```

**Create replacements file (`replacements.txt`):**
```
579b464db66ec23bdd000001e2f8fdd6e6d7a3d7403f38f==REDACTED_DATAGOV_KEY
AIzaSyBTvv12cHn2DeoK9yObIVzvhK4mIt9B0Dg==REDACTED_FIREBASE_KEY
```

**Run the cleanup:**
```bash
cd d:\KrishiKonnect
git filter-repo --replace-text replacements.txt
```

**Clean up and force push:**
```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force-with-lease
```

### Option 2: Using BFG Repo-Cleaner

**Installation:**
```bash
# Download from https://rtyley.github.io/bfg-repo-cleaner/
# Or on macOS: brew install bfg
```

**Create a file with secrets to remove (`secrets.txt`):**
```
579b464db66ec23bdd000001e2f8fdd6e6d7a3d7403f38f
AIzaSyBTvv12cHn2DeoK9yObIVzvhK4mIt9B0Dg
```

**Run the cleanup:**
```bash
bfg --delete-files secrets.txt --replace-text replacements.txt d:\KrishiKonnect
cd d:\KrishiKonnect
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force-with-lease
```

### Option 3: Using git filter-branch

**⚠️ This is slower but uses only git built-ins:**

```bash
cd d:\KrishiKonnect

# Remove specific API key from all commits
git filter-branch --tree-filter \
  "git ls-files -z | xargs -0 sed -i 's/579b464db66ec23bdd000001e2f8fdd6e6d7a3d7403f38f/REDACTED/g'" \
  -- --all

# Clean up
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git gc --aggressive --prune=now
git push --force-with-lease
```

---

## 🔐 Securing API Keys in Google Cloud

After removing secrets from history, regenerate your keys:

### Firebase API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your Firebase API key
4. Click **Edit** → **Regenerate**
5. Copy the new key to `.env.local`
6. Update `NEXT_PUBLIC_FIREBASE_API_KEY`

### Apply API Key Restrictions

1. In Google Cloud Console → **Credentials**
2. Click on your Firebase API key
3. Under **API restrictions**, select:
   - Android apps
   - iOS apps
   - Web apps
4. Under **Application restrictions**, select **HTTP referrers**
5. Add the following domains:
   ```
   localhost:3000
   *.vercel.app
   yourdomain.com
   ```

### Data.gov API Key

1. Go to [Data.gov API Documentation](https://data.gov.in/api-documentation)
2. Regenerate your API key if previously exposed
3. Update `NEXT_PUBLIC_DATA_GOV_API_KEY` in `.env.local`

---

## 🛡️ Preventing Future Leaks

### Using Gitleaks

**Installation:**
```bash
# On Windows
choco install gitleaks
# On macOS
brew install gitleaks
```

**Scan your repository before pushing:**
```bash
cd d:\KrishiKonnect
gitleaks detect
```

**To scan for specific patterns:**
```bash
gitleaks detect --source gitea --repo-url https://github.com/yourusername/krishikonnect
```

### Pre-commit Hook (Automated)

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
gitleaks detect --source local --verbose
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Using Husky (Recommended for Teams)

```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-push "gitleaks detect --source local"
```

---

## 📋 Environment Variable Validation

The application validates the following required environment variables:

### Firebase (lib/firebase.ts)
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`

### Mandi Service (lib/mandiService.ts)
- ✅ `NEXT_PUBLIC_DATA_GOV_API_KEY`

If any of these variables are missing, the application will throw an error at startup.

---

## 🔍 Checking for Other Secrets

Search your codebase for patterns that might indicate exposed secrets:

```bash
# Search for common secret patterns
git log --all --oneline --until=<DATE>
git log --all -p | grep -i "api[_-]?key\|secret\|token\|password"

# Using ripgrep (if installed)
rg "api[_-]?key|secret|token|password" --type-list
```

---

## ✅ Checklist for Complete Security Audit

- [ ] All hardcoded API keys removed from source code
- [ ] All secrets moved to `.env.local`
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.local.example` created with placeholder values
- [ ] Runtime validation added for required environment variables
- [ ] Git history cleaned using filter-repo or BFG
- [ ] All exposed keys regenerated in Google Cloud Console
- [ ] API key restrictions applied in Google Cloud
- [ ] Team members notified of history rewrite
- [ ] Gitleaks or similar secret scanning tool configured
- [ ] Pre-commit hooks configured (optional)
- [ ] Repository documentation updated

---

## 📚 References

- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [Google Cloud API Key Security](https://cloud.google.com/docs/authentication/api-keys)
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)

---

## 🚨 Emergency Contact

If you accidentally commit secrets to a public repository:

1. **Stop immediately** - do not push
2. **Regenerate all compromised keys** in Google Cloud Console
3. **Notify team members** and project leads
4. **Run git-filter-repo** to remove from history
5. **Force push** to update remote repository
6. **Monitor API usage** for any unauthorized access

---

**Last Updated:** March 6, 2026
**Project:** KrishiKonnect
**Status:** Security hardening in progress
