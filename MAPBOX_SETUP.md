# 🗺️ Mapbox Setup for TRAFFIX

## Quick Setup (2 minutes)

### 1. Get a Free Mapbox Token

1. Go to https://account.mapbox.com/auth/signup/
2. Sign up for free (no credit card required)
3. Go to https://account.mapbox.com/access-tokens/
4. Copy your "Default public token" (starts with `pk.`)

### 2. Add Token to Your Project

Create or update `.env.local` in the `code/` directory:

```bash
# In code/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

### 3. Restart Frontend

```bash
# Stop the frontend (Ctrl+C)
npm run dev
```

That's it! The map should now load.

## ✅ What You Get

- **Interactive map** with pan & zoom
- **Event markers** color-coded by type:
  - 🔴 Red: Incidents & Traffic Jams
  - 🟡 Amber: Disabled Vehicles
  - 🔵 Blue: Construction Work
  - 🟣 Purple: Obstructions
  - 🔵 Cyan: Weather
  
- **Click markers** to see event details
- **Auto-updates** when you change region/time
- **Region-aware** centering:
  - Virginia: Centers on Richmond area
  - DC: Centers on Washington DC
  - All: Shows both regions

## 🆓 Free Tier Details

Mapbox free tier includes:
- ✅ 50,000 map loads per month
- ✅ No credit card required
- ✅ Perfect for demos & development

## 🔧 Troubleshooting

### Map shows blank or error

**Check 1: Token is set**
```bash
cd code
cat .env.local | grep MAPBOX
```

Should show: `NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here`

**Check 2: Frontend restarted**

You MUST restart the Next.js dev server after adding the token:
```bash
# Stop with Ctrl+C
npm run dev
```

**Check 3: Token is valid**

- Go to https://account.mapbox.com/access-tokens/
- Verify token is listed and active
- Copy it again if needed

### Map loads but no markers

**Check API is returning data:**
```bash
curl -X POST http://localhost:8000/api/map-data \
  -H "Content-Type: application/json" \
  -d '{"region": "Virginia", "time_period": "CUSTOM", "limit": 100}'
```

Should return events with `lat` and `lon` fields.

### Console errors about Mapbox

If you see "Failed to fetch" or CORS errors:
- Make sure you're using the public token (starts with `pk.`)
- Not the secret token (starts with `sk.`)

## 🎨 Customizing

### Change Map Style

Edit `code/components/digital-twin-map.tsx`:

```typescript
mapStyle="mapbox://styles/mapbox/dark-v11"     // Dark mode
mapStyle="mapbox://styles/mapbox/streets-v12"   // Detailed streets
mapStyle="mapbox://styles/mapbox/satellite-v9"  // Satellite view
```

### Change Event Colors

Edit the `EVENT_COLORS` object in `digital-twin-map.tsx`:

```typescript
const EVENT_COLORS: Record<string, string> = {
  "Incident": "#your-color-here",
  // ...
}
```

## 📊 Current Map Features

✅ Shows 100 most recent events  
✅ Color-coded by event type  
✅ Click markers for details  
✅ Region filtering (DC/VA/All)  
✅ Time period filtering  
✅ Responsive & smooth  
✅ Loading states  
✅ Legend showing event types  

## 🚀 Production Deployment

For Vercel deployment, add the token as an environment variable:

1. Go to your Vercel project settings
2. Environment Variables section
3. Add: `NEXT_PUBLIC_MAPBOX_TOKEN` = `pk.your_token_here`
4. Redeploy

---

**Need help?** Check the Mapbox docs: https://docs.mapbox.com/help/getting-started/

