# KrishiKonnect 🌾

A farmer-friendly agricultural web platform built for a hackathon.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Features

- 📚 **Crop Library** - Comprehensive information about various crops
- 💰 **Mandi Prices** - Real-time market rates
- 🤝 **Farmer Community** - Connect with fellow farmers
- 🚚 **Transport Services** - Find reliable transport for crops
- 🤖 **AI Advisor** - Get expert farming advice powered by AI
- 📊 **Data Analytics** - Track your farming metrics

## Mandi Prices Implementation

### Mock Dataset & Architecture
Due to limited availability of public mandi APIs, KrishiKonnect currently uses a comprehensive mock dataset covering:
- **18 Crops:** Wheat, Rice, Maize, Barley, Bajra, Jowar, Cotton, Sugarcane, Groundnut, Mustard, Soybean, Sunflower, Potato, Onion, Tomato, Chickpea, Lentil, Tur
- **10 States:** Punjab, Haryana, Uttar Pradesh, Rajasthan, Madhya Pradesh, Maharashtra, Gujarat, Karnataka, Telangana, Tamil Nadu
- **40 Mandis:** 4 mandis per state

### System Design
- **Scalable Architecture:** The mock dataset is stored in `/data/mandiPrices.json` with a clean structure that supports easy integration with real Agmarknet APIs
- **Crop-First UI:** Farmers select a crop, then view prices across all mandis grouped by state
- **Mock Live Updates:** Prices are updated with realistic ±2% variations on each load to simulate real market volatility
- **Performance Optimized:** React Context caching (`MandiProvider`) prevents unnecessary refetching across user sessions
- **Trend Analysis:** Each mandi includes trend indicators (up/down/stable) with 7-day price charts using Recharts

### Components
- `components/MandiPriceCard.tsx` - Display individual mandi prices with min/max/modal prices
- `components/MandiTrendChart.tsx` - 7-day price history visualization with high/low/average stats
- `app/mandi/page.tsx` - Main interface for browsing crops and viewing mandi prices
- `lib/MandiContext.tsx` - Centralized caching and state management for prices

### API Migration Path
When integrating with a real API (e.g., Agmarknet):
1. Replace `/data/mandiPrices.json` with API calls
2. Update `MandiContext.tsx` to fetch from the real endpoint
3. Implement proper error handling and retry logic
4. Add real-time socket updates if available

## Language Support

The platform is **Hindi-first** with full English support. Users can toggle between languages at any time, with preferences stored in localStorage.

## Color Palette

- Background: `#FAF3E0`
- Primary Heading: `#1F3C88`
- Primary Button/Accent: `#B85C38`
- Agriculture Accent: `#7FB069`
- Data Highlight: `#F2A541`
- Body Text: `#1D1D1D`
- Borders: `#D8CFC0`

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
app/
  ├── layout.tsx          # Root layout
  ├── page.tsx            # Language selection page
  ├── home/               # Home page with all sections
  ├── crop-library/       # Crop information
  ├── mandi/              # Market prices
  ├── community/          # Farmer community
  ├── transport/          # Transport services
  └── ai-advisor/         # AI-powered advice

components/
  ├── Navbar.tsx          # Navigation bar
  ├── Footer.tsx          # Footer
  ├── HeroSection.tsx     # Hero section
  ├── FeatureGrid.tsx     # Features grid
  ├── FeatureCard.tsx     # Individual feature card
  ├── HowItWorks.tsx      # How it works section
  ├── AIHighlight.tsx     # AI advisor highlight
  ├── CTASection.tsx      # Call-to-action
  └── LanguageSelector.tsx # Language selection component

data/
  ├── crops.json          # Crop data
  └── mandi.json          # Market price data

lib/
  └── translations.ts     # Translation utilities
```

## Deployment

This project is ready to deploy on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

Built for hackathon purposes.
