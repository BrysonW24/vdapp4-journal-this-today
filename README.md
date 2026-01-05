# This, Today - Digital Journal App

**A beautiful Day One-inspired journaling app built with Next.js 15**

Built by [Vivacity Digital Apps](https://vivacitydigitalapps.com)

---

## 🎯 Features

### ✨ Core Journaling Features
- **Rich Text Editor** - TipTap editor with formatting, links, and media
- **Multiple Journals** - Organize entries into separate journals
- **Calendar View** - Browse entries by date
- **Search & Filter** - Quick search with highlighting
- **Tags & Moods** - Categorize and track emotional states
- **Media Support** - Add photos and voice recordings
- **Templates & Prompts** - Quick start with guided writing

### 🔐 Authentication & Onboarding
- **Welcome Screen** - Day One-style splash with background image
- **Sign In with Apple** - Ready for Apple authentication
- **Email/Password Login** - Traditional authentication
- **Premium Trial** - Onboarding flow with 1-month free trial

### 🎨 Beautiful UI/UX
- **Dark Mode** - Full dark mode support with next-themes
- **Responsive Design** - Mobile-first, works on all devices
- **Glassmorphism** - Modern visual effects
- **Smooth Animations** - Polished transitions throughout
- **Profile Management** - Account settings with localStorage persistence

### 📊 Analytics & Insights
- **Writing Streaks** - Track consecutive days journaling
- **Stats Dashboard** - Total entries, days journaled, media count
- **On This Day** - See past entries from the same date
- **Recent Activity** - Quick access to latest entries

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000/welcome](http://localhost:3000/welcome) to see the welcome screen.

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── welcome/           # Day One-style welcome screen
│   ├── login/             # Gekkos-style login page
│   ├── premium/           # Premium trial onboarding
│   ├── journal/           # Main entries list
│   │   ├── new/          # New entry editor
│   │   └── [id]/         # Individual entry view
│   ├── journals/          # Journal management
│   ├── calendar/          # Calendar view
│   ├── prompts/           # Writing prompts
│   ├── account/           # Profile settings
│   └── api/              # API routes
├── components/
│   ├── Layout.tsx        # Main app layout with navigation
│   └── ui/               # shadcn/ui components
├── stores/
│   └── journal-store.ts  # Zustand state management
└── styles/               # Global styles
```

---

## 🔑 Key Technologies

### Frontend
- **Next.js 15.1.0** - App Router with React Server Components
- **React 19.0.0** - Latest React features
- **TypeScript 5.7** - Full type safety
- **Tailwind CSS 3.4** - Utility-first styling
- **TipTap 3.14** - Rich text editor
- **next-themes 0.4** - Dark mode support

### State Management
- **Zustand 5.0** - Lightweight state management
- **localStorage** - Client-side data persistence

### UI Components
- **shadcn/ui** - Accessible component library
- **Radix UI** - Headless primitives
- **Lucide React** - 1000+ icons
- **Sonner** - Toast notifications

### Authentication (Ready to Connect)
- **NextAuth.js 5.0** - Authentication framework
- **Apple Sign In** - OAuth integration ready
- **Email/Password** - Credential provider

### Future Database (Optional)
- **Prisma 6.1** - ORM for database
- **PostgreSQL** - Production database

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` based on `.env.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database (optional - currently using localStorage)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# External Services (optional)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

### Background Image

Add a custom background image for the welcome screen:
1. Place your image at `/public/images/journal-background.jpg`
2. Recommended size: 1920x1080 or higher
3. Current placeholder: Unsplash image

---

## 📱 User Journey

1. **Welcome Screen** (`/welcome`)
   - Day One-style with background image
   - Continue with Apple / Sign In / Skip

2. **Login** (`/login`) *if user clicks "I have an account"*
   - Clean Gekkos-style card
   - Email/password form

3. **Premium Trial** (`/premium`) *if user skips or signs in*
   - Timeline showing benefits
   - 1-month free trial offer

4. **Main App** (`/journal`)
   - Quick Start actions
   - Recent entries
   - On This Day
   - Stats dashboard

5. **Account Settings** (`/account`)
   - Profile management
   - Preferences
   - Security settings

---

## 🎨 Customization

### Colors

The app uses a blue-to-purple gradient theme. Customize in `tailwind.config.ts`:

```typescript
colors: {
  primary: '#2563EB',    // Blue 600
  secondary: '#9333EA',  // Purple 600
}
```

### Branding

Update the app name and logo:
- App name: Change "This, Today" in [Layout.tsx](src/components/Layout.tsx)
- Logo emoji: Change 📔 to your preferred icon
- Welcome title: Update "DAY ONE" in [welcome/page.tsx](src/app/welcome/page.tsx)

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server at localhost:3000

# Building
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Type check with TypeScript
npm run format           # Format code with Prettier

# Database (if using Prisma)
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio

# Mobile (Capacitor)
npm run sync:capacitor   # Sync web assets to mobile
```

---

## 🚢 Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BrysonW24/vdapp4-journal-this-today)

### Manual Deploy

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit: This, Today journal app"
git push origin main
```

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. Environment Variables (Vercel Dashboard):
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Vercel deployment URL
   - Optional: Database, Stripe, Analytics

---

## 📚 Documentation

For detailed documentation, see:
- [AUTH_FLOW.md](AUTH_FLOW.md) - Authentication & onboarding flow
- [CURRENT_STATUS.md](docs/CURRENT_STATUS.md) - Development status

---

## 🛣️ Roadmap

### Current (v1.0)
- ✅ Beautiful auth pages (Welcome, Login, Premium)
- ✅ Rich text editor with TipTap
- ✅ Multiple journals support
- ✅ Search & filter entries
- ✅ Dark mode
- ✅ localStorage persistence
- ✅ Account settings
- ✅ Calendar view
- ✅ Writing prompts
- ✅ Stats dashboard

### Planned (v1.1)
- [ ] Real Apple Sign In integration
- [ ] Backend authentication with Prisma
- [ ] Stripe payment integration
- [ ] Email verification
- [ ] Password reset flow
- [ ] Export entries (PDF, JSON)
- [ ] Entry sharing
- [ ] Media upload & storage
- [ ] Voice recording
- [ ] Geolocation tagging

### Future (v2.0)
- [ ] Mobile apps (iOS, Android via Capacitor)
- [ ] End-to-end encryption
- [ ] Cloud sync across devices
- [ ] Collaborative journals
- [ ] AI writing assistant
- [ ] Mood tracking analytics
- [ ] Habit tracking integration

---

## 📄 License

MIT

---

## 🤝 Support

Built with ❤️ by [Vivacity Digital Apps](https://vivacitydigitalapps.com)

For questions or issues, please open an issue on GitHub.

---

## 🙏 Credits

- Inspired by [Day One](https://dayoneapp.com/) for the beautiful design
- Login design inspired by Gekkos Financial Dashboard
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
