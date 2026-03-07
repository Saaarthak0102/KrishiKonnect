# PHASE 2: Emoji Replacement with React Icons - Progress Report

## ✅ COMPLETED FILES

### Core Components (✅ Done)
- `components/FeatureGrid.tsx` - All feature icons replaced
- `components/Sidebar.tsx` - Navigation icons replaced
- `components/HeroSection.tsx` - Hero wheat icon replaced
- `components/CropCard.tsx` - Star icons replaced
- `components/LandingNavbar.tsx` - Logo wheat icon replaced
- `components/Navbar.tsx` - Logo wheat icon replaced
- `components/Footer.tsx` - Brand wheat icon replaced
- `components/AIHighlight.tsx` - Robot icon replaced
- `components/TransportBookingHistory.tsx` - Calendar icon replaced

### AI Advisor Components (✅ Done)
- `components/ai-advisor/DataSources.tsx` - All data source icons replaced
- `components/ai-advisor/AIThinking.tsx` - Loading spinner and step icons replaced
- `components/ai-advisor/AnswerCard.tsx` - All answer card icons replaced

### Page Files (✅ Done)
- `app/layout.tsx` - Metadata title emoji removed
- `app/ai-advisor/page.tsx` - Wheat icons replaced
- `app/community/page.tsx` - Chat and thumbs up icons replaced
- `app/dashboard/layout.tsx` - Logo wheat icon replaced
- `app/dashboard/page.tsx` - All dashboard icons replaced

---

## 🔄 REMAINING FILES TO UPDATE

### High Priority - Page Files
1. **app/crop-library/page.tsx** - 7 instances
   - Lines 158, 165: Wheat icons in titles
   - Lines 239, 310, 322, 323: Star icons for "My Crops"
   - Line 310: Search icon (🔍)

2. **app/crop-library/[cropId]/page.tsx** - 5 instances  
   - Lines 87, 92, 102, 122: Info section icons
   - Line 175: Star toggle icon

3. **app/mandi/page.tsx** - 2 instances
   - Lines 391, 597: Star icons for "My Crops" buttons

4. **app/mandi/[cropId]/page.tsx** - 1 instance
   - Line 169: Star icon for "Best Price Today"

### High Priority - Components
5. **components/ai-advisor/ChatHistorySidebar.tsx** - 2 instances
   - Line 55: Wheat logo icon
   - Line 154: Check/cross icons for delete confirm

6. **components/ai-advisor/ContextChips.tsx** - 4 instances
   - Lines 17-21: Context chip emojis in template literals

7. **components/ai-advisor/SuggestedQuestions.tsx** - 6 instances
   - Lines 12, 17, 35, 40: Emoji properties in question objects
   - Lines 123-124: Info box text emojis

8. **components/dashboard/MarketInsightCard.tsx** - 6 instances
   - Lines 129, 134, 178: Chart icons
   - Line 214: Trend arrows (3 instances)

9. **components/dashboard/LatestCommunityQuestionCard.tsx** - 4 instances
   - Lines 83, 142, 178: Wheat crop emojis
   - Line 212: Chat bubble icon

10. **components/dashboard/LatestAIChatCard.tsx** - 5 instances
    - Lines 113, 149, 190: Robot icons
    - Lines 168, 210: Crop tag icons

11. **components/MyCropsWithPrices.tsx** - 4 instances
    - Lines 170, 175, 207, 231: Wheat icons

12. **components/FeaturePageLayout.tsx** - 1 instance
    - Line 67: Logo wheat icon

13. **components/community/AskQuestionBox.tsx** - 4 instances
    - Lines 16-20: Crop emoji properties in objects

14. **components/community/ChatCard.tsx** - 3 instances
    - Line 238: Location pin
    - Line 271: Thumbs up
    - Line 280: Chat bubble

15. **components/community/ReplyItem.tsx** - 3 instances
    - Line 129: Location pin
    - Line 146: Thumbs up  
    - Line 155: Chat bubble

16. **components/community/ThreadView.tsx** - 4 instances
    - Lines 79, 83: Location and crop icons
    - Line 118: Chat bubble
    - Line 162: Photo icon

### Translation File
17. **lib/translations.ts** - 20+ instances
    - All translation strings containing emojis (⭐, 🌾, 💰, 📍, 📈, 🤖, 👨‍🌾)
    - **Note**: Keep emojis in translation strings as they're part of the text content

---

## 📋 REACT ICONS MAPPING

### Icons to Use

```typescript
// From react-icons/gi (Game Icons)
import { GiWheat, GiPlantSeed } from 'react-icons/gi'

// From react-icons/ai (Ant Design)
import { AiFillStar, AiOutlineStar, AiOutlineSearch, AiOutlineHome, AiOutlineCheckCircle } from 'react-icons/ai'

// From react-icons/md (Material Design)
import { MdLocationOn, MdStorefront, MdCalendarToday, MdEditCalendar, MdOutlineTrackChanges } from 'react-icons/md'

// From react-icons/fa (Font Awesome)
import { FaTruck, FaUser, FaGlobeAsia, FaCamera } from 'react-icons/fa'

// From react-icons/hi (Heroicons)
import { HiOutlineChartBar, HiOutlineLightBulb, HiUserGroup } from 'react-icons/hi'

// From react-icons/bs (Bootstrap Icons)
import { BsChatDots } from 'react-icons/bs'

// From react-icons/bi (BoxIcons)
import { BiLike } from 'react-icons/bi'

// From react-icons/fi (Feather Icons)
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'

// From react-icons/wi (Weather Icons)
import { WiDaySunny } from 'react-icons/wi'

// From react-icons/io5 (Ionicons 5)
import { IoLibrary } from 'react-icons/io5'

// From react-icons/ri (Remix Icon)
import { RiRobot2Line } from 'react-icons/ri'
```

### Emoji → Icon Mapping

| Emoji | React Icon | Size (Feature) | Size (Inline) |
|-------|------------|----------------|---------------|
| 🌾 | `<GiWheat />` | 32px | 20-24px |
| 🌱 | `<GiPlantSeed />` | 32px | 20px |
| ⭐ (filled) | `<AiFillStar />` | - | 20px |
| ☆ (outline) | `<AiOutlineStar />` | - | 20px |
| 🔍 | `<AiOutlineSearch />` | - | 20px |
| 💰 | `<MdStorefront />` | 32px | 20px |
| 📍 | `<MdLocationOn />` | - | 20px |
| 📅 | `<MdCalendarToday />` | - | 20px |
| 📋 | `<MdEditCalendar />` | - | 28px |
| 🚚 | `<FaTruck />` | 32px | 24px |
| 👨‍🌾 | `<FaUser />` | - | 20px |
| 🌍 | `<FaGlobeAsia />` | - | 20px |
| 🤖 | `<RiRobot2Line />` | 32px | 20-24px |
| 📊 | `<HiOutlineChartBar />` | 32px | 20px |
| 💡 | `<HiOutlineLightBulb />` | - | 20px |
| 🤝 | `<HiUserGroup />` | 32px | 20px |
| 💬 | `<BsChatDots />` | - | 20px |
| 👍 | `<BiLike />` | - | 20px |
| 📈 | `<FiTrendingUp />` | - | 20px |
| 📉 | `<FiTrendingDown />` | - | 20px |
| ➡️ | `<FiMinus />` | - | 20px |
| 🌤️ | `<WiDaySunny />` | - | 20-24px |
| 🏠 | `<AiOutlineHome />` | - | 20px |
| 📚 | `<IoLibrary />` | 32px | 20px |
| 🎯 | `<MdOutlineTrackChanges />` | - | 20px |
| 📷 | `<FaCamera />` | - | 20px |

---

## 🎯 NEXT STEPS

### Immediate Action Items
1. Complete replacements in remaining page files (crop-library, mandi)
2. Update dashboard components
3. Update AI advisor sidebar and context components
4. Update community components
5. Consider keeping emojis in translation strings (lib/translations.ts) as they're part of the text content

### Testing Checklist After Completion
- [ ] All pages render without emoji characters
- [ ] Icons display correctly with consistent sizing
- [ ] No console errors related to React Icons
- [ ] Icon colors match design theme (krishi-agriculture, etc.)
- [ ] Mobile responsiveness maintained
- [ ] Accessibility not impacted (icons have proper aria-labels where needed)

---

## 📊 PROGRESS SUMMARY

- **Total Files with Emojis**: ~35 files
- **Completed**: 13 files (37%)
- **Remaining**: 17 files (63%)
- **Total Emoji Instances**: ~100+
- **Replaced**: ~40 emojis
- **Remaining**: ~60 emojis

---

**Last Updated**: Phase 2 in progress
**react-icons Version**: Latest (installed successfully)
