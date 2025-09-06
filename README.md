
# Kenya Movers AI

Kenya Movers AI is a modern web application for instant, AI-powered moving quotes in Kenya. It features live location autocomplete, dynamic quote estimation, mover profiles, and a seamless user experience for both customers and moving companies.

**Live App:** [https://kenya-movers-ai.vercel.app](https://kenya-movers-ai.vercel.app)

---

## Features

- 🚚 **Instant Moving Quotes**: Get real-time, AI-powered cost estimates for your move.
- 📍 **Location Autocomplete**: Search for any location in Kenya with Google Places API and static fallback for major towns.
- 🏠 **Property Details**: Specify both current and destination property types and sizes for accurate quotes.
- 📦 **Inventory & Services**: Add inventory, special requirements, and select extra services.
- 🧑‍💼 **Mover Profiles**: View and review professional movers.
- 🔒 **Authentication**: Secure login and quote history for users.
- 📊 **Admin Dashboard**: Movers can manage quotes and respond to requests.
- ⚡ **Fast & Responsive**: Built with React 18, Vite, and shadcn/ui for a modern, mobile-friendly experience.
- 🌍 **Supabase Backend**: Secure, scalable, and serverless with edge functions for AI estimation, distance, and WhatsApp integration.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres, Auth, Edge Functions)
- **APIs**: Google Maps/Places, OpenAI (for AI estimation)
- **State Management**: TanStack Query, React Context
- **Deployment**: Vercel (recommended), Docker (alternative)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dmuchai/kenya-movers-ai.git
cd kenya-movers-ai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and Google Maps API keys
```

### 4. Run the App Locally

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal).

---

## Deployment

### Deploy to Vercel (Recommended)

1. [Sign up for Vercel](https://vercel.com/) and connect your GitHub repo.
2. Set the following environment variables in the Vercel dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_GOOGLE_MAPS_API_KEY`
  - `VITE_APP_NAME`
  - `VITE_APP_URL` (e.g. `https://kenya-movers-ai.vercel.app`)
3. Click **Deploy**.

### Docker (Alternative)

```bash
docker build -t kenya-movers-ai .
docker run -p 8080:80 kenya-movers-ai
```

---

## Supabase Edge Functions

This app uses Supabase Edge Functions for:
- AI quote estimation (`ai-estimator`)
- Distance matrix calculations (`distance-matrix`)
- Location autocomplete (`places`)
- WhatsApp messaging (`whatsapp-message`)

Deploy/update with:
```bash
supabase functions deploy ai-estimator
supabase functions deploy distance-matrix
supabase functions deploy places
supabase functions deploy whatsapp-message
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT
