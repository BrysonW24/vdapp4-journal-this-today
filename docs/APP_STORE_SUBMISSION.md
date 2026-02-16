# This, Today — App Store Submission Guide

## App Store Metadata

### App Name
`This, Today`

### Subtitle (30 chars max)
`Private Journal & Mood Tracker`

### Category
- **Primary**: Lifestyle
- **Secondary**: Health & Fitness

### Age Rating
`4+`

### Price
Free

---

### Description

Your journal, your device, your privacy.

This, Today is a beautifully designed journaling app that keeps everything on your device. No accounts, no cloud, no tracking. Just you and your thoughts.

WRITE YOUR WAY
- Rich text editor with formatting, headings, and lists
- Voice-to-text lets you speak your entries
- Writing templates and daily prompts to spark ideas
- Tag, categorise, and organise entries across multiple journals

TRACK YOUR MOODS
- Pick from 5 mood levels for every entry
- See your journaling streak and stats at a glance
- "On This Day" memories surface past entries

STAY PRIVATE
- All data stored locally on your device
- No account required, no sign-up
- No analytics, no tracking, no cookies
- Export anytime in JSON, PDF, Markdown, CSV, or plain text

MAKE IT YOURS
- Light and dark mode
- Multiple journals with custom names and icons
- Location tagging for entries
- Calendar view to browse by date
- Search across all your entries instantly

Built by Vivacity Digital. Questions? hello@vivacitydigital.com.au

---

### Keywords (100 chars max)
```
journal,diary,mood,tracker,gratitude,writing,private,offline,mindfulness,reflection
```

### URLs

| Field | URL |
|-------|-----|
| Privacy Policy | `https://vdapp4-journal-this-today.vercel.app/privacy` |
| Support URL | `https://vdapp4-journal-this-today.vercel.app/help` |
| Marketing URL | *(optional — leave blank for now)* |

---

## Apple Developer Setup

### 1. App Store Connect — Create App

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps** > click **+** > **New App**
3. Fill in:
   - **Platforms**: iOS
   - **Name**: `This, Today`
   - **Primary Language**: English (Australia)
   - **Bundle ID**: `com.vivacitydigital.thistoday`
   - **SKU**: `thistoday-ios`
   - **User Access**: Full Access

### 2. Xcode — Signing & Capabilities

In Xcode (project already open):

1. Click the **App** target in the left sidebar
2. Go to **Signing & Capabilities** tab
3. Check **"Automatically manage signing"**
4. Select your **Team** from the dropdown
5. Xcode will auto-create the App ID and provisioning profile
6. Under the **General** tab, verify:
   - Display Name: `This, Today`
   - Bundle Identifier: `com.vivacitydigital.thistoday`
   - Version: `1.0.0`
   - Build: `1`
7. Under **Minimum Deployments**, set iOS to `16.0` (recommended minimum)

### 3. Build & Archive

1. In Xcode toolbar, set the target to **"Any iOS Device (arm64)"**
2. **Product** > **Archive** (or ⌘⇧B to build first, then archive)
3. Wait for the archive to complete
4. The **Organizer** window opens automatically
5. Select the archive > **Distribute App**
6. Choose **App Store Connect** > **Upload**
7. Follow the prompts (leave defaults)
8. Wait for upload to complete

### 4. App Store Connect — Complete Submission

Back in App Store Connect:

1. Go to **My Apps** > **This, Today**
2. Under **App Information**:
   - Subtitle: `Private Journal & Mood Tracker`
   - Category: Lifestyle / Health & Fitness
   - Privacy Policy URL: `https://vdapp4-journal-this-today.vercel.app/privacy`
3. Under **Pricing and Availability**:
   - Price: Free
   - Availability: All territories
4. Under **App Privacy**:
   - Data collection: **None** (the app collects no data)
   - This is accurate — all data stays on-device
5. Under **1.0 Prepare for Submission**:
   - Add screenshots (see below)
   - Paste the description from above
   - Add keywords
   - Support URL: `https://vdapp4-journal-this-today.vercel.app/help`
   - Select the build you uploaded
   - Review contact info
6. Click **Add for Review** > **Submit for Review**

---

## Screenshots

### Required Sizes
- **6.7" iPhone** (iPhone 15 Pro Max): 1290 x 2796 px
- **6.5" iPhone** (iPhone 11 Pro Max): 1242 x 2688 px — *can reuse 6.7" with auto-resize*

### Recommended 6 Screenshots

| # | Screen | What to show |
|---|--------|-------------|
| 1 | Journal list | Main page with a few entries in grid view, showing mood emojis and tags |
| 2 | New entry | Rich text editor with mood picker selected, a template applied |
| 3 | Entry detail | A completed entry with mood, tags, location, and formatted content |
| 4 | Dark mode | Journal list or entry in dark mode |
| 5 | Quick Start | The Quick Start section with daily prompt visible |
| 6 | Settings | Export options showing JSON, PDF, Markdown, CSV, Plain Text |

### How to Capture

1. Run the app on **iPhone 15 Pro Max** simulator in Xcode (⌘R)
2. Create a few sample entries with different moods, tags, and locations
3. Navigate to each screen
4. In the Simulator menu: **File** > **Save Screen** (⌘S)
5. Screenshots save to your Desktop

---

## App Privacy Questionnaire

When Apple asks about data collection practices:

| Question | Answer |
|----------|--------|
| Do you collect any data? | **No** |
| Data linked to user identity? | **No** |
| Data used to track users? | **No** |
| Third-party analytics? | **No** |

Select **"None of the above"** for all data types. This is accurate because:
- All journal data is stored in IndexedDB on-device
- No server calls for user data
- No analytics SDKs (Vercel Analytics is web-only, not in the iOS app)
- No third-party tracking

---

## Final QA Checklist

Test on iOS Simulator or physical device before submitting:

- [ ] Welcome page loads > "Get Started" works
- [ ] Tutorial tour runs through all 7 steps
- [ ] Create entry with title, mood, tags, content
- [ ] Edit existing entry — changes persist
- [ ] Delete entry — confirm dialog, entry removed
- [ ] Voice recording — microphone permission prompt appears
- [ ] Location tagging — location permission prompt appears
- [ ] Dark mode toggle — all pages render correctly
- [ ] Export JSON — file shares correctly on iOS
- [ ] Import JSON — entries restored
- [ ] Help page — FAQ accordion works
- [ ] Privacy page — renders and scrolls
- [ ] Terms page — renders and scrolls
- [ ] Settings > Replay Tutorial — resets and navigates
- [ ] Multiple journals — create, switch, manage
- [ ] Search entries — filters by title/content
- [ ] Favorites — star/unstar, filter works
- [ ] Calendar view link — navigates correctly
- [ ] Form validation — empty fields show inline errors
- [ ] App works offline (all data is local)
- [ ] App icon appears correctly on home screen
- [ ] Splash screen shows on launch
