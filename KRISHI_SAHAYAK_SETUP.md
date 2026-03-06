# Krishi Sahayak - AI Advisory System Setup Guide

## Feature Overview

Krishi Sahayak is an AI-powered agricultural advisor built into KrishiKonnect that provides:

- **ChatGPT-like Interface**: Clean, familiar chat UI with sidebar for chat history
- **Crop Analysis**: Upload images of crops or diseases for AI diagnosis
- **Expert Advice**: Structured farming guidance (Problem → Action → Prevention)
- **Multi-language**: Full support for Hindi and English
- **Farmer Context**: Personalized advice based on location, crop, and season

## User Guide

### 1. Accessing Krishi Sahayak

Navigate to `/ai-advisor` or click "AI Advisor" in the navigation menu.

**Note**: Users must be logged in to use the service.

### 2. Starting a New Chat

- Click the **"+ New Chat"** button in the sidebar
- The assistant greets you with: "नमस्ते! मैं कृषि सहायक हूँ 🌾"
- Select from suggested questions or type your own

### 3. Asking Questions

Ask about:
- 🌾 Crop diseases and symptoms
- 🐛 Pest control and management
- 💧 Irrigation and water management
- 🧪 Fertilizers and soil health
- 📊 Farming practices and techniques

Example questions:
- "My wheat crop has yellow leaf spots, what should I do?"
- "What's the best fertilizer for cotton at the vegetative stage?"
- "How much water does corn need during summer?"

### 4. Uploading Crop Images

1. Click the **📸 Image** button in the chat input
2. Select an image of your crop or disease
3. The image preview shows above the input area
4. Type your question (optional)
5. Click **Send**

The AI will analyze the image and provide diagnosis and solutions.

### 5. Chat Management

- **View History**: All chats appear in the left sidebar
- **Switch Chats**: Click any chat to load its messages
- **Delete Chat**: Hover over a chat and click 🗑️, then confirm

## Administrator Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# Required for Gemini AI (server-side only)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase variables (already configured, optional to verify)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click **"Get API Key"**
3. Create or select a Google Cloud project
4. Generate an API key
5. Copy and paste into `.env.local`

### 3. Firestore Setup

Ensure Firestore is enabled in your Firebase project and the default database exists.

The system automatically creates:
- Collection: `ai_chats`
- Subcollections: `messages` (auto-created per chat)

### 4. Firebase Storage Setup

1. Enable Storage in Firebase Console
2. Set Storage location (same as Firestore)
3. Storage rules are configured for authenticated users

### 5. Deploy Firestore Rules (Optional)

For production, deploy security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // AI Chats
    match /ai_chats/{chatId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
      
      match /messages/{messageId} {
        allow read, write: if request.auth.uid == get(/databases/$(database)/documents/ai_chats/$(chatId)).data.userId;
      }
    }
  }
}
```

## API Reference

### `/api/ai` (POST)

**Request:**
```json
{
  "prompt": "My wheat crop is yellowing",
  "language": "en|hi",
  "imageUrl": "https://...",  // optional
  "systemPrompt": "..."        // optional
}
```

**Response:**
```json
{
  "success": true,
  "text": "AI response text"
}
```

### Error Handling

- **Missing API Key**: Returns graceful fallback response
- **API Failure**: Falls back to helpful canned response
- **Invalid Input**: Returns 400 with error message
- **Server Error**: Returns 500 with generic error

## Customization

### Change System Prompt

Edit `lib/aiAdvisor.ts` - `KRISHI_SAHAYAK_SYSTEM_PROMPT` constant

### Modify Suggested Questions

Edit `components/ai-advisor/SuggestedQuestions.tsx` - Update question arrays

### Styling

- Colors: Use KrishiKonnect theme from `tailwind.config.ts`
- Animations: Managed by Framer Motion
- Layout: Responsive with Tailwind CSS

### Language Support

- Add translations to `lib/translations.ts`
- Create new language keys following existing pattern
- Update language switcher in Navbar

## Troubleshooting

### "AI Advisor not available"
- Check `GEMINI_API_KEY` is set in `.env.local`
- Verify API key is valid and has quota available
- Check Gemini API quota limits in Google Cloud Console

### Images not uploading
- Verify Firebase Storage is enabled
- Check file size (max 5MB)
- Verify file is a valid image format
- Check browser console for specific errors

### Chat not loading
- Verify user is authenticated
- Check Firestore database exists
- Verify `ai_chats` collection can be accessed
- Check browser Network tab for API errors

### Messages not appearing realtime
- Check Firestore subscription active (browser console)
- Verify Firestore rules allow read access
- Check for Firestore quota limits

## Performance Tips

1. Limit chat history to ~50 messages per chat
2. Implement message pagination if needed (future)
3. Cache farmer context to reduce Firestore reads
4. Use image compression before upload
5. Monitor Gemini API costs and usage

## Security Notes

- ✅ GEMINI_API_KEY is server-side only (never exposed)
- ✅ User can only access their own chats (Firestore rules)
- ✅ Images are stored in user-specific folders
- ✅ No sensitive data in logs
- ✅ Input validation on server-side

## Support & Feedback

For issues or improvements, refer to:
- KrishiKonnect Project Docs
- Gemini API Documentation
- Firebase Documentation
