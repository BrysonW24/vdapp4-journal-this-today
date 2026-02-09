<p align="center">
  <img src="public/icon.png" width="100" alt="This Today Logo">
</p>

<h1 align="center">This, Today</h1>

<p align="center">
  <strong>A beautiful space for your thoughts.</strong><br>
  <sub>Day One-inspired journaling for the modern web. Write freely, reflect deeply.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TipTap-Editor-000?style=flat-square" alt="TipTap">
  <img src="https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p align="center">
  <a href="https://vivacitydigital.com.au">vivacitydigital.com.au</a>
</p>

---

### The Idea

Journaling shouldn't feel like work. This, Today strips away the friction — no clunky interfaces, no feature overload. Just a beautiful blank page that invites you to write, with smart tools when you need them and silence when you don't.

---

### What It Does

| | |
|---|---|
| **Rich Text Editor** | TipTap-powered — formatting, links, media, all keyboard-driven |
| **Multiple Journals** | Organize entries by theme, project, or mood |
| **Calendar View** | Browse your history by date |
| **Search** | Full-text search with highlighting |
| **Tags & Moods** | Track emotional patterns over time |
| **Writing Prompts** | Beat the blank page — curated prompts when you're stuck |
| **On This Day** | Revisit what you wrote a year ago |
| **Dark Mode** | Easy on the eyes, day or night |

---

### The Experience

```
Welcome → Sign In → Premium Trial → Write → Reflect
```

Beautiful onboarding. Frictionless first entry. Stats, streaks, and patterns surface over time.

---

### Tech Stack

| | |
|---|---|
| Next.js 15.1 | App Router |
| React 19 | UI layer |
| TipTap 3.14 | Rich text editor |
| Zustand 5.0 | State + localStorage persistence |
| Tailwind CSS + shadcn/ui | Styling |
| NextAuth.js 5.0 | Auth (ready to connect) |
| next-themes | Dark mode |

---

### Architecture

```
src/
├── app/
│   ├── welcome/        # Onboarding
│   ├── login/          # Authentication
│   ├── premium/        # Trial flow
│   ├── journal/        # Entries
│   ├── calendar/       # Calendar view
│   ├── prompts/        # Writing prompts
│   └── account/        # Settings
├── components/         # Shared UI
├── stores/             # Zustand state
└── styles/             # Global CSS
```

---

### Quick Start

```bash
npm install && npm run dev
```

Visit `http://localhost:3000/welcome` to begin.

---

### On the Roadmap

- [ ] Apple Sign In & backend auth
- [ ] Stripe payments for premium
- [ ] PDF / JSON export
- [ ] Media uploads & voice recording
- [ ] Mobile apps via Capacitor
- [ ] End-to-end encryption
- [ ] AI writing assistant

---

<p align="center">
  <sub>Part of the <strong>Vivacity Digital</strong> app portfolio — <code>vdapp4</code></sub><br>
  <sub>Built by <a href="https://github.com/BrysonW24">Bryson Walter</a> · <a href="https://vivacitydigital.com.au">vivacitydigital.com.au</a></sub>
</p>
