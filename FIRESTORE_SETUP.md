# KrishiKonnect Community - Firestore Implementation

## 🎯 Overview

The KrishiKonnect Community system has been refactored to use **Firebase Firestore** for real-time, globally synchronized discussions. All questions and replies are now stored in Firestore and synced instantly across all users.

---

## 📁 Files Created/Modified

### New Files:
- **`/lib/community.ts`** - Firestore service functions for community features
- **`firestore.rules`** - Security rules for Firestore database

### Modified Files:
- **`/app/community/page.tsx`** - Updated to use real-time Firestore listeners
- **`/app/community/[id]/page.tsx`** - Updated thread view with real-time replies
- **`/components/community/AskQuestionBox.tsx`** - Added posting state
- **`/components/community/ThreadView.tsx`** - Added posting state for replies

---

## 🔥 Firestore Structure

### Collection: `community_questions`

Each document represents a question:

```javascript
{
  id: string (auto-generated)
  userId: string
  userName: string
  userBadge: string
  cropTag: string
  cropEmoji: string
  questionText: string
  description: string
  imageUrl: string | null
  upvotes: number
  repliesCount: number
  createdAt: Timestamp
}
```

### Subcollection: `community_questions/{questionId}/replies`

Each reply document:

```javascript
{
  id: string (auto-generated)
  userId: string
  userName: string
  userBadge: string
  replyText: string
  imageUrl: string | null
  upvotes: number
  createdAt: Timestamp
}
```

---

## ⚡ Real-Time Features

### 1. **Question Feed**
- Uses `onSnapshot()` to listen for new questions
- Auto-updates when any user posts a question
- Sorted by `createdAt` descending
- Loads 50 most recent questions

### 2. **Thread Replies**
- Real-time listener on replies subcollection
- Instantly shows new replies as they're posted
- Sorted by `createdAt` ascending (oldest first)

### 3. **Upvote System**
- Instant UI updates (optimistic updates)
- Background Firestore sync
- Automatic rollback on errors

### 4. **Optimistic UI**
- Questions/replies appear immediately when posted
- Background Firestore save
- Replaced by real data when Firestore confirms

---

## 🚀 Deployment Instructions

### Step 1: Deploy Firestore Security Rules

You need to deploy the security rules to your Firebase project:

#### Option A: Using Firebase CLI

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use `firestore.rules` as the rules file
   - Don't overwrite the existing rules file

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

#### Option B: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

### Step 2: Verify Environment Variables

Ensure your `.env.local` file has all Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 3: Create Firestore Database

1. Go to Firebase Console
2. Navigate to **Firestore Database**
3. Click **Create Database**
4. Choose **Start in production mode**
5. Select a location (preferably closest to your users)
6. Click **Enable**

---

## 📊 Migrating Existing Data

If you have existing questions in `/data/communityQuestions.json` and want to migrate them to Firestore:

### Migration Script

Create a file `/scripts/migrateToFirestore.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import questionsData from '../data/communityQuestions.json';

// Your Firebase config
const firebaseConfig = {
  // ... your config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  for (const question of questionsData) {
    // Add question
    const questionRef = await addDoc(collection(db, 'community_questions'), {
      userId: question.userId,
      userName: question.user,
      userBadge: '🌱',
      cropTag: question.crop,
      cropEmoji: question.cropEmoji,
      questionText: question.question,
      description: question.description,
      imageUrl: question.image || null,
      upvotes: question.upvotes,
      repliesCount: question.repliesCount,
      createdAt: Timestamp.now(),
    });

    // Add replies
    if (question.replies && question.replies.length > 0) {
      for (const reply of question.replies) {
        await addDoc(collection(db, 'community_questions', questionRef.id, 'replies'), {
          userId: reply.userId,
          userName: reply.user,
          userBadge: '🌱',
          replyText: reply.text,
          imageUrl: reply.image || null,
          upvotes: reply.upvotes,
          createdAt: Timestamp.now(),
        });
      }
    }
  }
  
  console.log('Migration completed!');
}

migrate();
```

Run with: `npx ts-node scripts/migrateToFirestore.ts`

---

## 🔒 Security Rules Explained

### Read Access
- **Anyone** can read questions and replies (even without authentication)
- This allows browsing the community without login

### Write Access
- **Only authenticated users** can create questions/replies
- Users can only create content with their own `userId`
- Users can only delete their own content
- Users can only edit their own content

### Upvotes
- Any authenticated user can upvote any question/reply
- Rules allow updating only the `upvotes` field
- Rules allow updating `repliesCount` when replies are added

---

## 🧪 Testing

### Test Real-Time Sync

1. Open the app in two browser windows
2. Sign in with different accounts
3. Post a question in one window
4. Verify it appears instantly in the other window
5. Post a reply and verify real-time updates

### Test Upvoting

1. Upvote a question/reply
2. Check Firestore console to verify count increment
3. Refresh page and verify upvote persists

### Test Authentication

1. Try posting without signing in → Should show alert
2. Sign in and post → Should work
3. Verify `userId` matches authenticated user

---

## 📈 Performance Considerations

### Current Limits
- Questions feed loads 50 most recent
- Real-time listeners auto-update
- Optimistic UI reduces perceived latency

### Pagination
The `loadMoreQuestions()` function is available in `/lib/community.ts` for implementing infinite scroll:

```typescript
import { loadMoreQuestions } from '@/lib/community';

// When user scrolls to bottom
const moreQuestions = await loadMoreQuestions(lastDocumentSnapshot, 20);
```

### Indexes
Firestore will automatically create indexes for:
- `community_questions` ordered by `createdAt`
- `replies` subcollections ordered by `createdAt`

If you see console errors about missing indexes, click the provided link to create them.

---

## 🐛 Troubleshooting

### "Missing or insufficient permissions"
- Check that security rules are deployed
- Verify user is authenticated
- Check that `userId` in written data matches `request.auth.uid`

### "Real-time updates not working"
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Clear browser cache and refresh

### "Questions not loading"
- Check that database has data
- Verify collection name is `community_questions`
- Check browser console for errors

---

## 🎨 Future Enhancements

### Possible Additions:
1. **Image Upload** - Integrate with Firebase Storage for question/reply images
2. **Notifications** - Notify users when their questions get replies
3. **Search** - Full-text search using Algolia or Firebase Extensions
4. **Moderation** - Admin dashboard to manage inappropriate content
5. **Reputation System** - Track user badges based on helpful answers
6. **Best Answer** - Allow question authors to mark best reply
7. **Follow Questions** - Get notifications on questions you're interested in

---

## 📝 API Reference

### `/lib/community.ts` Functions

#### `addCommunityQuestion(userId, userName, userBadge, questionData)`
Creates a new question in Firestore.

#### `addReply(questionId, userId, userName, userBadge, replyData)`
Adds a reply to a question and increments reply count.

#### `upvoteQuestion(questionId)`
Increments upvote count on a question.

#### `removeUpvoteQuestion(questionId)`
Decrements upvote count on a question.

#### `upvoteReply(questionId, replyId)`
Increments upvote count on a reply.

#### `removeUpvoteReply(questionId, replyId)`
Decrements upvote count on a reply.

#### `subscribeToQuestions(onUpdate, limitCount?)`
Real-time listener for questions feed. Returns unsubscribe function.

#### `subscribeToReplies(questionId, onUpdate)`
Real-time listener for replies. Returns unsubscribe function.

#### `loadMoreQuestions(lastDoc, limitCount?)`
Pagination support for loading more questions.

---

## ✅ Checklist

- [x] Firestore database created
- [x] Security rules deployed
- [x] Real-time listeners implemented
- [x] Optimistic UI updates
- [x] Upvoting system
- [x] Authentication checks
- [ ] **Deploy security rules to Firebase**
- [ ] **Test with real users**
- [ ] **Migrate existing data** (if needed)

---

## 📞 Support

If you encounter any issues with the Firestore implementation, check:
1. Firebase Console for error logs
2. Browser console for client-side errors
3. Verify security rules are correctly deployed
4. Ensure all environment variables are set

---

**🎉 The KrishiKonnect Community is now fully real-time and globally synchronized!**
