# Krishi Sahayak - Quick Start Guide for Developers

## 🚀 Quick Setup (5 minutes)

### 1. Get Gemini API Key
```bash
# Visit: https://aistudio.google.com
# Click "Get API Key" → Select/Create project → Generate API key
```

### 2. Configure Environment
```bash
# Add to .env.local
GEMINI_API_KEY=your_api_key_here
```

### 3. Build & Run
```bash
npm run build
npm run dev
```

### 4. Test the Feature
```
1. Open http://localhost:3000/ai-advisor
2. Log in with test account
3. Click "+ New Chat"
4. Ask: "My wheat crop has yellow leaves, what should I do?"
5. Get AI response!
```

---

## 🏗️ Architecture Overview

### Pages
- **`/ai-advisor`** - Main AI advisor page (protected route)

### Components
- **`Sidebar`** - Chat list with new/delete
- **`ChatWindow`** - Message display + input
- **`MessageBubble`** - Individual messages
- **`ChatInput`** - Text + image input
- **`SuggestedQuestions`** - Starter prompts

### Libraries
- **`lib/aiAdvisor.ts`** - Firestore + Gemini operations
- **`app/api/ai/route.ts`** - Gemini API endpoint

### Data
- **Firestore**: `ai_chats/{chatId}/messages`
- **Storage**: `ai_chat_images/{chatId}/{userId}/{timestamp}`

---

## 💻 Common Tasks

### Adding a New Suggested Question

Edit `components/ai-advisor/SuggestedQuestions.tsx`:

```typescript
const SUGGESTED_QUESTIONS_EN = [
  // Add new question here
  {
    emoji: '🌱',
    title: 'Seedling Care',
    question: 'How do I protect seedlings from pests?',
  },
  // ... rest of questions
]

const SUGGESTED_QUESTIONS_HI = [
  // Add Hindi version
  {
    emoji: '🌱',
    title: 'बीज की देखभाल',
    question: 'मैं बीजों को कीटों से कैसे बचाऊँ?',
  },
]
```

### Changing the System Prompt

Edit `lib/aiAdvisor.ts` - find `KRISHI_SAHAYAK_SYSTEM_PROMPT`:

```typescript
const KRISHI_SAHAYAK_SYSTEM_PROMPT = `
You are Krishi Sahayak, a friendly AI agriculture advisor...
// Modify this text
`
```

### Customizing Colors

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      'krishi-primary': '#B85C38',      // Change chat bubble color
      'krishi-agriculture': '#7FB069',  // Change AI message color
      // ... other colors
    },
  },
}
```

### Adding New API Parameters

Edit `app/api/ai/route.ts`:

```typescript
interface AIRequestBody {
  prompt: string
  language?: 'en' | 'hi'
  imageUrl?: string
  systemPrompt?: string
  // Add new parameter here
  temperature?: number
}
```

---

## 🐛 Debugging

### Check API Call
```typescript
// In browser console
fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Test question',
    language: 'en'
  })
}).then(r => r.json()).then(console.log)
```

### Check Firestore Data
```
Firebase Console → Firestore Database
→ Collections → ai_chats
→ {chatId} → messages
```

### Check Gemini API
```bash
# Test API key is working
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Check Logs
```bash
# Server logs
npm run dev
# Check terminal output for errors

# Client logs
Browser Console (F12)
# Check for errors
```

---

## 📊 Database Schema

### Chat Document
```json
{
  "userId": "user123",
  "title": "नई चैट",
  "createdAt": "2026-03-06T10:30:00Z",
  "updatedAt": "2026-03-06T10:35:00Z",
  "language": "hi"
}
```

### Message Document
```json
{
  "role": "user|assistant",
  "content": "Question or response text",
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "createdAt": "2026-03-06T10:32:00Z"
}
```

---

## 🔒 Security Checklist

- [ ] `GEMINI_API_KEY` NOT in `.env.local` (git ignored)
- [ ] Firestore rules deployed
- [ ] Storage rules configured
- [ ] Users can only access own chats
- [ ] API key rotated every 90 days
- [ ] No sensitive data in logs
- [ ] Input validation on server side

---

## 📈 Performance Tips

1. **Reduce API Calls**
   - Cache farmer context
   - Batch message operations
   - Limit chat history to 50 messages

2. **Optimize Images**
   - Compress before upload
   - Max 5MB file size
   - Resize to max 1024x1024

3. **Firestore Optimization**
   - Use real-time subscriptions efficiently
   - Index frequently queried fields
   - Cleanup old messages periodically

4. **Frontend Optimization**
   - Lazy load components
   - Use local state for UI
   - Cleanup subscriptions

---

## 🚨 Common Issues & Solutions

### Issue: "API Key not configured"
**Solution**: Add `GEMINI_API_KEY` to `.env.local` and restart dev server

### Issue: "Firestore permission denied"
**Solution**: Deploy firestore.rules to Firebase Console or check auth state

### Issue: Images not uploading
**Solution**: 
- Check Firebase Storage enabled
- Verify file size < 5MB
- Check file is valid image

### Issue: Messages not appearing realtime
**Solution**:
- Check Firestore subscription active
- Verify user authenticated
- Check browser Network tab

### Issue: Build fails with TypeScript errors
**Solution**:
- Run `npm run build` to see full errors
- Check import paths are correct
- Verify all types are imported

---

## 🧪 Testing

### Unit Test Example
```typescript
// Test message creation
const chatId = await createNewChat(userId, 'en')
const messageId = await addMessageToChat(chatId, 'user', 'Test message')
expect(messageId).toBeDefined()
```

### Integration Test Example
```typescript
// Test full chat flow
const chatId = await createNewChat(userId, 'en')
await addMessageToChat(chatId, 'user', 'Question')
const response = await generateKrishiAdvice('Question', undefined, {})
await addMessageToChat(chatId, 'assistant', response)

const messages = await fetchChatMessages(chatId)
expect(messages.length).toBe(2)
```

---

## 📚 Useful Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

## 🎯 Next Steps

1. ✅ Set up Gemini API key
2. ✅ Run `npm run build` to verify
3. ✅ Test with `npm run dev`
4. ✅ Deploy Firestore rules
5. ✅ Monitor production usage
6. Plan Phase 2 enhancements

---

## 📞 Support

For issues or questions:
1. Check KRISHI_SAHAYAK_IMPLEMENTATION.md
2. Check KRISHI_SAHAYAK_SETUP.md
3. Review code comments
4. Check browser console for errors
5. Review Firestore rules

---

**Happy Farming with AI! 🌾**
