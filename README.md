# TRAFFIX Frontend

Modern Next.js frontend for the TRAFFIX AI Traffic Intelligence Platform.

## 🎨 Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **API Client**: Custom TypeScript client
- **Analytics**: Vercel Analytics
- **Icons**: Lucide React

## 📦 Installation

```bash
npm install
# or
yarn install
```

## 🚀 Development

### Prerequisites
- Node.js 18+ installed
- Backend API running on `http://localhost:8000`

### Environment Setup

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
code/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
│
├── components/            # React Components
│   ├── platform-header.tsx        # Header with region/time selectors
│   ├── ban-numbers.tsx            # Dashboard metrics cards
│   ├── chat-interface.tsx         # AI chat panel
│   ├── road-events.tsx            # Events list
│   ├── news-feed.tsx              # News from Tavily
│   ├── digital-twin-map.tsx       # Map visualization
│   ├── time-period-selector.tsx   # Date range picker
│   └── ui/                        # shadcn/ui components
│
└── lib/                   # Utilities
    ├── api-client.ts      # Backend API wrapper
    └── traffix-context.tsx # Global state management
```

## 🔌 API Integration

### API Client (`lib/api-client.ts`)

All backend communication goes through the API client:

```typescript
import { fetchMetrics, fetchEvents, sendChatMessage } from '@/lib/api-client'

// Fetch dashboard metrics
const metrics = await fetchMetrics('Virginia', 'MTD')

// Get road events
const events = await fetchEvents('Virginia', 'MTD', 20)

// Send chat message
const response = await sendChatMessage(
  'Why was traffic bad yesterday?',
  'manager',  // persona
  'quick',    // mode
  'Virginia',
  'MTD'
)
```

### State Management (`lib/traffix-context.tsx`)

Components use React Context for shared state:

```typescript
import { useTraffixContext } from '@/lib/traffix-context'

function MyComponent() {
  const { region, setRegion, timePeriod, refreshTrigger } = useTraffixContext()
  
  useEffect(() => {
    // Re-fetch data when region or time period changes
    loadData()
  }, [region, timePeriod, refreshTrigger])
}
```

## 🎯 Key Features

### 1. Dashboard Metrics (BAN Numbers)
- Total Trips
- Forecast Trips
- Network Reliability
- Active Events
- Real-time updates from PostgreSQL

### 2. AI Chat Interface
- **3 Personas**: Executive, Manager, Analyst
- **2 Modes**: Quick, Deep
- Context-aware (region + time period)
- Powered by LangGraph agents

### 3. Road Events
- Real-time traffic events
- Event types: Accidents, Construction, Weather
- Severity indicators
- Location details

### 4. News Feed
- Traffic and transportation news
- Powered by Tavily API
- Region-filtered
- External links to sources

### 5. Region & Time Controls
- **Regions**: DC, VA, All
- **Time Periods**: MTD, QTD, YTD, Custom Range
- POC data: Oct 19 - Nov 2, 2025
- Global state synchronization

## 🎨 Component Patterns

### Data Fetching Pattern

```typescript
"use client"

import { useEffect, useState } from "react"
import { fetchData } from "@/lib/api-client"
import { useTraffixContext } from "@/lib/traffix-context"

export function MyComponent() {
  const { region, timePeriod, refreshTrigger } = useTraffixContext()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const result = await fetchData(region, timePeriod)
        setData(result)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [region, timePeriod, refreshTrigger])

  if (loading) return <LoadingState />
  return <DataDisplay data={data} />
}
```

## 🚀 Building for Production

```bash
npm run build
npm start
```

## 📤 Deploying to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: Git Integration

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your production API URL
4. Deploy!

### Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 🧪 Testing Locally

1. **Start the backend** (in parent directory):
   ```bash
   cd ..
   source .venv/bin/activate
   cd api
   python main.py
   ```

2. **Start the frontend** (in this directory):
   ```bash
   npm run dev
   ```

3. **Test the integration**:
   - Open http://localhost:3000
   - Change region from VA to DC
   - Watch metrics update
   - Try the chat interface
   - Check browser console for errors (F12)

## 🐛 Troubleshooting

### "Failed to fetch" errors
- Verify backend is running on port 8000
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors

### Components not updating
- Verify `useTraffixContext()` is used correctly
- Check that component is inside `<TraffixProvider>`
- Look for errors in browser console

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contributing

This frontend is part of the TRAFFIX platform. See the main project README for overall architecture and contribution guidelines.

