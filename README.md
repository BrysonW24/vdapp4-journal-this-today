<p align="center">
  <img src="public/icon.png" width="120" alt="This Today Logo">
</p>

<h1 align="center">This, Today</h1>

<p align="center">
  <strong>A Beautiful Space for Your Thoughts</strong><br>
  <sub>Day One-inspired journaling for the modern web.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TipTap-Editor-000?style=flat-square" alt="TipTap">
</p>

---

## Why This, Today?

Journaling shouldn't feel like work. **This, Today** is designed to make capturing your thoughts as frictionless as possible - beautiful by default, powerful when you need it.

---

## Features at a Glance

| Feature | Description |
|---------|-------------|
| **Rich Text Editor** | TipTap-powered with formatting, links, and media |
| **Multiple Journals** | Organize entries into separate journals |
| **Calendar View** | Browse entries by date |
| **Search & Filter** | Find entries instantly with highlighting |
| **Tags & Moods** | Track emotional patterns over time |
| **Writing Prompts** | Never stare at a blank page again |
| **Dark Mode** | Easy on the eyes, day or night |
| **On This Day** | Revisit past entries from the same date |

---

## The Experience

```
Welcome → Login → Premium Trial → Journal → Reflect
```

1. **Beautiful Onboarding** - Day One-style welcome with stunning visuals
2. **Quick Authentication** - Apple Sign In ready, email/password available
3. **Premium Path** - 1-month free trial with clear value proposition
4. **Frictionless Writing** - Quick actions get you writing immediately
5. **Meaningful Insights** - Stats, streaks, and patterns surface over time

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15.1 (App Router) |
| **UI** | React 19, Tailwind CSS, shadcn/ui |
| **Editor** | TipTap 3.14 |
| **State** | Zustand 5.0 + localStorage |
| **Auth** | NextAuth.js 5.0 (ready to connect) |
| **Themes** | next-themes for dark mode |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit [http://localhost:3000/welcome](http://localhost:3000/welcome) to begin.

---

## Project Structure

```
src/
├── app/
│   ├── welcome/        # Day One-style welcome
│   ├── login/          # Authentication
│   ├── premium/        # Trial onboarding
│   ├── journal/        # Main entries
│   ├── calendar/       # Calendar view
│   ├── prompts/        # Writing prompts
│   └── account/        # Settings
├── components/         # Shared UI
├── stores/             # Zustand state
└── styles/             # Global CSS
```

---

## Customization

### Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: '#2563EB',    // Blue 600
  secondary: '#9333EA',  // Purple 600
}
```

### Branding

- App name: Update in `Layout.tsx`
- Welcome screen: Customize `welcome/page.tsx`
- Background: Add image to `/public/images/journal-background.jpg`

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BrysonW24/vdapp4-journal-this-today)

### Environment Variables

```bash
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://...  # Optional
```

---

## Roadmap

### Current (v1.0)

- Beautiful auth flow
- Rich text editing
- Multiple journals
- Search & calendar
- Dark mode
- Writing prompts

### Planned (v1.1)

- Real Apple Sign In
- Backend auth
- Stripe payments
- PDF/JSON export
- Media upload
- Voice recording

### Future (v2.0)

- Mobile apps (Capacitor)
- End-to-end encryption
- Cloud sync
- AI writing assistant

---

<p align="center">
  <strong>Built by Vivacity Digital</strong><br>
  <a href="https://vivacitydigital.com.au">vivacitydigital.com.au</a>
</p>

<p align="center">
  <sub>Inspired by <a href="https://dayoneapp.com/">Day One</a>. Built with Next.js and shadcn/ui.</sub>
</p>
