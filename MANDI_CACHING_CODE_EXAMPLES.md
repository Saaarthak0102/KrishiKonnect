# Mandi Caching - Code Examples and Integration Guide

## Code Examples

### 1. Using the Cache Function in Components

```typescript
'use client'
import { fetchMandiPricesWithCache, MandiPrice } from '@/lib/mandiService'
import { useEffect, useState } from 'react'

export default function MyMandiComponent() {
  const [prices, setPrices] = useState<MandiPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState('Uttar Pradesh')

  useEffect(() => {
    const loadPrices = async () => {
      // Load cached instantly, fetch fresh in background
      const cached = await fetchMandiPricesWithCache(
        state,
        500,
        (freshData) => {
          // Called when fresh API data arrives
          console.log('New data from API:', freshData)
          setPrices(freshData)
        }
      )
      
      // Set initial cached data
      setPrices(cached)
      setLoading(false)
    }

    loadPrices()
  }, [state])

  return (
    <div>
      <h1>Mandi Prices for {state}</h1>
      {loading && <p>Loading...</p>}
      {!loading && (
        <div>
          {prices.map((price) => (
            <div key={price.id}>
              <h2>{price.cropEn} at {price.mandiEn}</h2>
              <p>Price: ₹{price.modalPrice}/quintal</p>
              <p>Updated: {price.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 2. Getting Cached Data Without Fetching

```typescript
// If you just want to check what's in cache without API calls
import { MandiPrice } from '@/lib/mandiService'

function getCacheForManualCheck(state: string): MandiPrice[] | null {
  try {
    if (typeof window === 'undefined') return null
    
    const cached = localStorage.getItem('mandi_prices_cache')
    if (!cached) return null
    
    const payload = JSON.parse(cached)
    
    // Only return if for requested state and not expired
    if (payload.state !== state) return null
    if (Date.now() - payload.timestamp > 5 * 60 * 1000) return null
    
    return payload.data
  } catch {
    return null
  }
}
```

### 3. Manually Clearing Cache

```typescript
// Clear all cached mandi prices
function clearMandiCache() {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem('mandi_prices_cache')
    console.log('Mandi cache cleared')
  } catch (error) {
    console.error('Failed to clear cache:', error)
  }
}

// Usage
clearMandiCache()
```

### 4. Format Time Helper (Used in MandiPriceCard)

```typescript
function getLastUpdatedLabel(dateString: string, lang: 'en' | 'hi'): string {
  try {
    const dateObj = new Date(dateString)
    if (Number.isNaN(dateObj.getTime())) {
      return lang === 'hi' ? 'आज अपडेट' : 'Updated Today'
    }

    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMinutes < 1) {
      return lang === 'hi' ? 'अभी अपडेट' : 'Just now'
    } else if (diffMinutes < 60) {
      return lang === 'hi'
        ? `${diffMinutes} मिनट पहले अपडेट`
        : `Updated ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffHours < 24) {
      return lang === 'hi'
        ? `${diffHours} घंटे पहले अपडेट`
        : `Updated ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else {
      return lang === 'hi'
        ? `${diffDays} दिन पहले अपडेट`
        : `Updated ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }
  } catch {
    return lang === 'hi' ? 'आज अपडेट' : 'Updated Today'
  }
}

// Usage
const label = getLastUpdatedLabel('2026-03-05T10:30:00', 'en')
// Returns: "Updated 2 hours ago"
```

### 5. Cache Size Monitor (for debugging)

```typescript
function getMandiCacheSize(): string {
  try {
    if (typeof window === 'undefined') return '0 B'
    
    const cached = localStorage.getItem('mandi_prices_cache')
    if (!cached) return '0 B'
    
    const bytes = new Blob([cached]).size
    const kb = bytes / 1024
    const mb = kb / 1024
    
    if (mb >= 1) return mb.toFixed(2) + ' MB'
    if (kb >= 1) return kb.toFixed(2) + ' KB'
    return bytes + ' B'
  } catch {
    return 'Unknown'
  }
}

// Usage in console
console.log('Mandi cache size:', getMandiCacheSize())
// Output: "Mandi cache size: 125.45 KB"
```

### 6. Testing Cache in Browser Console

```javascript
// Check if cache exists
const cached = localStorage.getItem('mandi_prices_cache')
if (cached) {
  const data = JSON.parse(cached)
  console.log('State:', data.state)
  console.log('Records:', data.data.length)
  console.log('Cached at:', new Date(data.timestamp))
  console.log('Age:', Date.now() - data.timestamp, 'ms')
  console.log('Expired?', Date.now() - data.timestamp > 5*60*1000)
}

// Clear cache manually
localStorage.removeItem('mandi_prices_cache')
console.log('Cache cleared')

// Simulate slow network (DevTools → Network tab → Throttling)
// Then navigate back to /mandi to see cache benefits
```

### 7. Cache Statistics Helper

```typescript
interface CacheStats {
  exists: boolean
  state: string | null
  records: number
  sizeKB: number
  ageSeconds: number
  isExpired: boolean
  hitRate?: number
}

function getMandiCacheStats(): CacheStats {
  try {
    if (typeof window === 'undefined') {
      return {
        exists: false,
        state: null,
        records: 0,
        sizeKB: 0,
        ageSeconds: 0,
        isExpired: true,
      }
    }

    const cached = localStorage.getItem('mandi_prices_cache')
    
    if (!cached) {
      return {
        exists: false,
        state: null,
        records: 0,
        sizeKB: 0,
        ageSeconds: 0,
        isExpired: true,
      }
    }

    const data = JSON.parse(cached)
    const ageSeconds = (Date.now() - data.timestamp) / 1000
    const isExpired = ageSeconds > 5 * 60 // 5 minutes
    const sizeKB = new Blob([cached]).size / 1024

    return {
      exists: true,
      state: data.state,
      records: data.data?.length || 0,
      sizeKB: parseFloat(sizeKB.toFixed(2)),
      ageSeconds: Math.floor(ageSeconds),
      isExpired,
    }
  } catch {
    return {
      exists: false,
      state: null,
      records: 0,
      sizeKB: 0,
      ageSeconds: 0,
      isExpired: true,
    }
  }
}

// Usage
const stats = getMandiCacheStats()
console.table(stats)
// Output:
// {
//   exists: true,
//   state: "Uttar Pradesh",
//   records: 45,
//   sizeKB: 156.23,
//   ageSeconds: 245,
//   isExpired: false
// }
```

## Integration Checklist

### Step 1: Verify Cache Functions Exist

- [ ] `lib/mandiService.ts` has `MANDI_CACHE_KEY`
- [ ] `lib/mandiService.ts` has `saveMandiCache()` function
- [ ] `lib/mandiService.ts` has `loadMandiCache()` function
- [ ] `lib/mandiService.ts` has `fetchMandiPricesWithCache()` export

### Step 2: Verify Page Component Updated

- [ ] `app/mandi/page.tsx` imports `fetchMandiPricesWithCache`
- [ ] useEffect uses new caching function
- [ ] onFresh callback updates state

### Step 3: Verify Card Component Updated

- [ ] `components/MandiPriceCard.tsx` has `getLastUpdatedLabel()` function
- [ ] Component displays "Updated X ago" label
- [ ] Works for both English and Hindi

### Step 4: Test & Verify

```bash
# Build project
npm run build

# Run development server
npm run dev

# Navigate to http://localhost:3000/mandi

# Test cache:
# 1. Load page - watch Network tab for API call
# 2. Refresh page - should see cached prices instantly
# 3. Check DevTools → Storage → Local Storage (look for 'mandi_prices_cache')
# 4. Change state - should fetch/cache for new state
```

## Performance Testing

### Measure Cache Hit Performance

```javascript
// In browser console while on /mandi page
performance.mark('startLoad')
// (page is already loaded with cache)
performance.mark('endLoad')
performance.measure('loadTime', 'startLoad', 'endLoad')
const measure = performance.getEntriesByName('loadTime')[0]
console.log('Cache hit load time:', measure.duration, 'ms')
```

### Simulate Slow Network

1. Open DevTools → Network tab
2. Click throttling dropdown (usually says "No throttling")
3. Select "Slow 3G" or "Fast 3G"
4. Navigate to /mandi
5. See instant loading from cache despite slow network

### Monitor API Calls

```javascript
// In console
let apiCalls = 0

// Patch fetch to count calls
const originalFetch = window.fetch
window.fetch = function(...args) {
  if (args[0]?.includes('agmarknet') || args[0]?.includes('api.data.gov.in')) {
    apiCalls++
    console.log('API call #' + apiCalls)
  }
  return originalFetch.apply(this, args)
}
```

## Debugging Tips

### Issue: Cache not persisting

```javascript
// Check localStorage availability
console.log(localStorage.getItem('test') === null)
localStorage.setItem('test', 'value')
console.log(localStorage.getItem('test')) // Should be 'value'
localStorage.removeItem('test')
```

### Issue: Prices not updating

```javascript
// Check cache age
const cached = JSON.parse(localStorage.getItem('mandi_prices_cache') || '{}')
const ageSeconds = (Date.now() - (cached.timestamp || 0)) / 1000
const expirySeconds = 5 * 60
console.log(`Cache age: ${ageSeconds}s, Expires in: ${expirySeconds - ageSeconds}s`)
```

### Issue: Wrong data displayed

```javascript
// Verify cache state matches selected state
const cached = JSON.parse(localStorage.getItem('mandi_prices_cache') || '{}')
console.log('Cached state:', cached.state)
// Should match the state selector on page
```

## Migration Guide (If Updating Existing Code)

### Before:
```typescript
const rows = await fetchMandiPrices(selectedState)
setStateRows(rows)
```

### After:
```typescript
const cachedData = await fetchMandiPricesWithCache(
  selectedState,
  500,
  (freshData) => setStateRows(freshData)
)
setStateRows(cachedData)
```

### Key Changes:
1. Function name: `fetchMandiPrices` → `fetchMandiPricesWithCache`
2. Add `onFresh` callback for background updates
3. Set state twice: once with cached, once with fresh

## Resources

- MDN localStorage docs: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Next.js client components: https://nextjs.org/docs/app/building-your-application/rendering/client-components
- React hooks: https://react.dev/reference/react/hooks
