# RentalMS

A rental management system built with React, Vite, Tailwind CSS, and a localStorage-backed Supabase-like API wrapper.

## Features

- Buildings and tenant management
- Deposit tracking and custom electricity rates
- Electricity billing and WhatsApp share links
- Local auth mode with browser-based storage
- Supabase integration for cloud storage
- Responsive UI with React Router v6

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` to `.env`

3. Run the development server

```bash
npm run dev
```

4. Open `http://localhost:5173`

## Environment Setup

### LocalStorage Mode (Default)

```env
VITE_USE_LOCAL_DB=true
```

### Supabase Mode

1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Go to Settings → API to get your credentials
4. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
5. Update your `.env` file:

```env
VITE_USE_LOCAL_DB=false
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** The demo user (owner@example.com / password123) is pre-seeded in the SQL schema.

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build production assets
- `npm run preview` - Preview production build
- `npm run lint` - Lint TypeScript files
