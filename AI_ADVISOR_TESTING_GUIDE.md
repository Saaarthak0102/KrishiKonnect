# Krishi Sahayak AI Advisor - Testing Guide

## Quick Start Testing

### Test the Crop Detection System

```bash
# Run the test suite
node test-ai-advisor.js
```

Expected output:
```
🧪 AI Advisor Classification Test Suite
============================================================

Test 1: ✓ "kya ghaziabad mai kela ugaya ja sakta hai"
Reason: Contains "kela" (banana in Hinglish)
Result: ✅ PASS (Crop detected)

Test 2: ✓ "gehun me kaunsi khad use kare"
Reason: Contains "gehun" (wheat in Hinglish)
Result: ✅ PASS (Crop detected)

[... more tests ...]

📊 Results: 7/8 passed
   ✅ Crop Detection: 7
   ⏳ Will use Gemini: 1
```

---

## Manual Testing

### Test Case 1: Hinglish Crop Question ✅

**Request:**
```json
{
  "userQuestion": "kya ghaziabad mai kela ugaya ja sakta hai",
  "location": "Uttar Pradesh",
  "crop": "Banana",
  "language": "en"
}
```

**Expected Behavior:**
- Crop "kela" detected instantly
- No Gemini classification needed
- Advisory generated using farm context

**Expected Response:**
```json
{
  "reply": "Ghaziabad (Uttar Pradesh) me kela ugaya ja sakta hai, lekin kuch conditions zaruri hain:

• Temperature: 20-35°C
• Well drained soil
• Proper irrigation
• Frost protection

Recommended varieties:
Grand Naine
Dwarf Cavendish"
}
```

---

### Test Case 2: Non-Farming Question ❌

**Request:**
```json
{
  "userQuestion": "Tell me a joke about farming",
  "language": "en"
}
```

**Expected Behavior:**
- Keyword "farming" detected
- Should pass (contains farming context)

**Expected Response:**
```json
{
  "reply": "[Farming-related advice]"
}
```

**Note:** This will be classified as farming since it contains the keyword "farming"

---

### Test Case 3: Generic Question Requiring Gemini

**Request:**
```json
{
  "userQuestion": "What is the best season for planting?",
  "location": "Punjab",
  "crop": "Wheat",
  "language": "hi"
}
```

**Expected Behavior:**
- No crop name found in question
- Sent to Gemini for classification via Tier 2
- Gemini returns "FARMING: YES"
- Advisory generated

**Response Time:** 2-5 seconds (Gemini API)

---

### Test Case 4: Out-of-Scope Question

**Request:**
```json
{
  "userQuestion": "What is the capital of India?",
  "language": "en"
}
```

**Expected Behavior:**
- No crop name detected
- Sent to Gemini for classification
- Gemini returns "FARMING: NO"
- Return out-of-scope message

**Expected Response:**
```json
{
  "reply": "⚠️ Krishi Sahayak only answers farming-related questions.\n\nPlease ask about:\n• Crops and seeds\n• Pest and disease treatment\n• Irrigation and water management\n• Fertilizers and manure\n• Weather and crop planning\n• Mandi prices"
}
```

---

## Testing via cURL

### Hindi Language Support

```bash
curl -X POST http://localhost:3000/api/ai-advisor \
  -H "Content-Type: application/json" \
  -d '{
    "userQuestion": "आम की सही देखभाल कैसे करें",
    "location": "Uttar Pradesh",
    "crop": "Mango",
    "language": "hi"
  }'
```

### Hinglish Language Support

```bash
curl -X POST http://localhost:3000/api/ai-advisor \
  -H "Content-Type: application/json" \
  -d '{
    "userQuestion": "gehun me kaunsi khad use kare",
    "location": "Punjab",
    "crop": "Wheat",
    "language": "en"
  }'
```

### English Language Support

```bash
curl -X POST http://localhost:3000/api/ai-advisor \
  -H "Content-Type: application/json" \
  -d '{
    "userQuestion": "How to prevent pest attack in cotton?",
    "location": "Karnataka",
    "crop": "Cotton",
    "language": "en"
  }'
```

---

## Performance Testing

### Metric 1: Crop Detection Speed (Tier 1)

**Test:** Questions with crop names
```bash
time node -e "
const crops = ['wheat', 'rice', 'mango', 'कपास']; // 150+ crops
const q = 'kya ghaziabad mai kela ugaya ja sakta hai';
const start = Date.now();
for(let i = 0; i < 1000; i++) {
  crops.some(c => q.includes(c));
}
console.log('Time:', Date.now() - start, 'ms');
"
```

**Expected:** < 5ms for 1000 iterations

### Metric 2: Overall Latency

| Scenario | Tier | Latency | Notes |
|----------|------|---------|-------|
| Crop detected | 1 | < 1ms | Instant |
| Generic farming | 2 | 2-5s | +Gemini call |
| Non-farming | 2 | 2-5s | +Gemini call |

---

## Debugging

### Enable Development Logging

```bash
NODE_ENV=development npm run dev
```

Check console for:
- Classification API calls
- Gemini response parsing
- Model fallback attempts

### Test Gemini API Key

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello"}]
    }]
  }'
```

---

## Regression Testing

### Before & After Comparison

#### Question: "kya ghaziabad mai kela ugaya ja sakta hai"

**BEFORE:** ❌ Rejected (keyword not in FARMING_KEYWORDS)
```json
{
  "reply": "कृषि सहायक मुख्य रूप से खेती से जुड़े सवालों में मदद करता है..."
}
```

**AFTER:** ✅ Accepted (crop "kela" detected)
```json
{
  "reply": "Ghaziabad (Uttar Pradesh) me kela ugaya ja sakta hai, lekin kuch conditions zaruri hain:

• Temperature: 20-35°C
• Well drained soil
• Proper irrigation
• Frost protection

Recommended varieties:
Grand Naine
Dwarf Cavendish"
}
```

---

## Common Issues & Solutions

### Issue 1: Gemini API Rate Limit

**Error:** `429 Too Many Requests`

**Solution:**
- Implement request throttling
- Add exponential backoff retry
- Cache classification results

### Issue 2: Slow Response (> 10s)

**Cause:** Gemini API latency or network issue

**Solution:**
- Check internet connection
- Verify Gemini API key
- Monitor Gemini service status

### Issue 3: Classification Always Returns "NO"

**Cause:** Gemini response parsing issue

**Solution:**
- Check response format in logs
- Verify prompt is being sent correctly
- Test with simpler questions

---

## UI Testing

### Chat Interface Tests

1. **Test crop detection:**
   - Type: "kya ghaziabad mai kela ugaya ja sakta hai"
   - Expected: Answer appears (no loading delay)

2. **Test error message display:**
   - Type: "Tell me a joke"
   - Expected: Warning message with bullet points

3. **Test language support:**
   - Switch to Hindi
   - Type Hindi question
   - Expected: Response in Hindi

4. **Test chat history:**
   - Ask multiple questions
   - Verify all messages stored
   - Check language detection per message

---

## Checklist for Verification

- [ ] Run test suite: `node test-ai-advisor.js`
- [ ] Test Hindi question manually
- [ ] Test Hinglish question manually
- [ ] Test English question manually
- [ ] Verify error message displays correctly
- [ ] Check response languages detected properly
- [ ] Verify chat history is stored
- [ ] Test image upload still works
- [ ] Check TypeScript compilation: `npx tsc --noEmit`
- [ ] Build passes: `npm run build`

---

## Success Criteria

✅ All test cases pass  
✅ No TypeScript errors  
✅ Crop detection < 1ms  
✅ Gemini fallback works  
✅ Error messages display correctly  
✅ Multi-language support verified  
✅ No breaking changes to API  
✅ Performance acceptable  

---

## Rollback Plan

If issues occur:

1. Restore backup of `app/api/ai-advisor/route.ts`
2. Revert to old validation function if needed
3. Existing deployments continue working

**Note:** No database migrations needed. Change is backward compatible.
