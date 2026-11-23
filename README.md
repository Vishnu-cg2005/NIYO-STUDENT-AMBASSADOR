# 🎓 Niyo Campus — Student Ambassador Portal

React · Vite · Supabase · NVIDIA NIM · Bootstrap

![License](https://img.shields.io/badge/License-MIT-purple.svg)

🚀 **Live Production Deployment:** [studentambassadorniyon.vercel.app](https://studentambassadorniyon.vercel.app)  
📦 **GitHub Repository:** [Vishnu-cg2005/NIYO-STUDENT-AMBASSADOR](https://github.com/Vishnu-cg2005/NIYO-STUDENT-AMBASSADOR)

---

## 📑 Table of Contents

- 🌟 Executive Overview
- ✨ Key System Highlights
- 🧰 Technology Stack
- 🏛️ System Architecture
- 📱 Dedicated Mobile Application View
- 📝 Student Application Flow & Country Search
- 📊 Student Dashboard & Profile Management
- 🎖️ Ambassador Portal (Approved Members)
- 🛡️ Internal Administration Portal
- 🤖 AI Growth Assistant (NVIDIA NIM)
- 🎨 Design System & UI Tokens
- 📁 Project Directory Structure
- 🔑 Environment Variables & Security
- 🚀 Quickstart & Installation
- 🌍 Production Deployment
- 🧪 Testing & Quality Assurance
- 🤝 Contributing & Code of Conduct
- 📄 License & Disclaimers

---

## 🌟 Executive Overview

The Niyo Campus Student Ambassador Portal is an all-in-one platform built to power university outreach, student community growth, and global financial literacy for Niyo. Designed for college ambassadors worldwide, it streamlines student enrollment, administrative vetting, community engagement, and campus campaigns through an intuitive, accessible web and mobile application.

## ✨ Key System Highlights

| Module | Core Purpose | Target Audience | Primary Capabilities |
|---|---|---|---|
| 🌐 Public Homepage | Brand discovery & program education | Prospective students, visitors | Hero showcase, program highlights, journey stages, FAQ accordion |
| 📝 Application Form | Multi-step candidate enrollment | Applicants | 3-step structured form, auto-save drafts, live country search (195+ countries) |
| 📊 Student Dashboard | Application lifecycle tracking | Registered students | Real-time status tracker, profile manager, review summary |
| 🎖️ Ambassador Portal | Campus campaign execution & community | Approved ambassadors | Peer directory, campus pitch toolkit, referral leaderboards |
| 🛡️ Admin Portal | Candidate evaluation & program control | Program managers, staff | Candidate pipeline, instant decisioning, analytics dashboard |
| 🤖 AI Growth Assistant | AI-powered campus marketing mentor | Ambassadors & admins | Event pitch generator, social post drafter, objection handler |

## 🧰 Technology Stack

### 💻 Frontend & Styling

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.0.0 | Declarative component hierarchy and fast reactive UI state |
| Vite | ^8.3.8 | Lightning-fast development HMR and optimized production bundling |
| Bootstrap | ^5.3.0 | Accessible structural grid primitives and responsive base helpers |
| React Icons (fi, bs) | ^5.4.0 | Feather & Bootstrap icon system for iconography and micro-actions |
| Custom Design System | styles.css | 5,000+ lines of custom Swiss-minimalist tokens, glassmorphism, and animations |

### 🗄️ Backend, Auth & Storage

| Technology | Role | Description |
|---|---|---|
| Supabase Client | Auth & Session | Real-time session handling, Google OAuth, and secure profile persistence |
| Supabase Server | @supabase/server | Edge function authentication validation and credential security |
| LocalStorage State | Draft & Session Cache | Offline resilience, draft preservation, and mock demo fallbacks |
| Countries Database | countries.json | 195+ country dataset with normalized identifiers for fast search |

### 🤖 AI Engine & Serverless APIs

| Technology | Provider | Details |
|---|---|---|
| NVIDIA NIM API | NVIDIA Cloud | Enterprise LLM inference (nvidia/nemotron-3.5-lightning-30b-a3b) |
| Express / Vite Middleware | Local Dev (server/) | Proxy server preventing client-side API key leakage during local dev |
| Netlify Functions | Production (netlify/) | Serverless edge function for AI assistant prompt-response streaming |

## 🏛️ System Architecture

## 📱 Dedicated Mobile Application View

The portal features a bespoke native mobile app experience specifically tailored for handheld touchscreens (≤ 768px), while keeping the desktop layout 100% untouched and pixel-perfect.

### 📲 Mobile Native Features vs Desktop

| Mobile Feature | Mobile View (≤ 768px) | Desktop View (> 768px) | Benefit |
|---|---|---|---|
| Sticky App Header | Sleek frosted app bar with circular back button & live step name | Full desktop navbar with multi-link navigation | Thumb-friendly navigation |
| Auto-Save Status | Green pulsing badge (✓ Saved) in top header | Standard status notice | Instant feedback that data is safe |
| Progress Stepper | 3-track segmented pill indicator with animated purple fill | Full horizontal node line with step titles | Clean header without clutter |
| Step Icon Badges | Colorful 44px icon badges for each section (FiUser, FiBook, FiAward) | Standard section headers | Visual orientation |
| Action Dock | Fixed bottom dock with safe-area padding for iPhone/Android home bars | Standard card button rows | Zero scrolling to submit/advance |
| Bottom Navigation Bar | Floating 5-tab bar (Home, About, Center Apply Pill, FAQs, Profile) | Hidden (display: none !important) | Native app feel throughout the portal |

## 📝 Student Application Flow & Country Search

The enrollment pipeline is divided into three focused stages to maximize completion rates and prevent form fatigue:

### 📋 Form Step Breakdown

| Step | Section Name | Key Form Fields | Validation Rules |
|---|---|---|---|
| 01 | Personal Details | Full Name, Email, Phone Number, College Name, Department, Year of Study, Country, City & State | Valid email regex, 7-18 digit phone, required country selection |
| 02 | Academic Details | Roll / Register Number, Graduation Year, CGPA or Percentage, LinkedIn URL, Resume Link | Year range (2020-2040), CGPA format, valid HTTP/HTTPS URLs |
| 03 | Community & Motivation | Motivation Essay, Campus Event Details, Declaration Checkbox | Minimum essay length, mandatory confirmation checkbox |

### 🌍 Live Country Search (SearchableCountrySelect)

- **Dataset:** Integrated directly with countries.json containing 195+ sovereign nations.
- **Resilient Focus Isolation:** onMouseDown and click event propagation isolation stops accidental dropdown dismissals while dragging scrollbars or typing.
- **Keyboard Accessible:** Full support for ArrowDown, ArrowUp, Enter (select without form submit), and Escape (dismiss).
- **Instant Search:** Real-time filtering matching any substring of the country name.

## 📊 Student Dashboard & Profile Management

Once an application is submitted or a student signs in with Supabase/Google Auth, they receive an interactive Student Dashboard:

| Component | Description |
|---|---|
| 🏷️ Status Tracker | Live status badge (Pending, Under Review, Approved, Rejected) with review date and ID |
| 🛡️ Duplicate Guard | Automatically locks new submissions when an active application is already in review |
| 📝 Review Card | Full collapsible summary of all submitted details, academic metrics, and links |
| 👤 Profile Completer | Guided onboarding for Google OAuth users to finalize college and department information |
| 🚀 Ambassador Pass | Unlocks the restricted Ambassador Portal as soon as status becomes Approved |

## 🎖️ Ambassador Portal (Approved Members)

Approved ambassadors gain access to a dedicated operations suite designed to maximize on-campus brand reach:

```text
┌──────────────────────────────────────────────────────────────┐
│  🎖️ NIYO AMBASSADOR COMMAND CENTER                           │
├───────────────┬──────────────────────────────────────────────┤
│ 💡 Campus AI  │ Generates tailored pitch decks & event ideas │
│ 👥 Community  │ Global directory of fellow campus leaders    │
│ 🎯 Campaigns  │ Active outreach initiatives & milestones     │
│ 📈 Analytics  │ Student engagement metrics & leaderboard     │
│ 📚 Resources  │ Brand assets, logos, pitch flyers & decks    │
└───────────────┴──────────────────────────────────────────────┘
```

- **Community Network:** Filter campus peers by country (India, UK, Singapore, etc.) and university.
- **Outreach Toolkit:** Downloadable official Niyo presentation decks, flyers, and approved brand assets.
- **Event Planner:** Guidelines and budget request templates for hosting campus orientation booths.

## 🛡️ Internal Administration Portal

An administrative operations console allowing program leads to evaluate and manage student cohorts:

| Admin Feature | Operational Function |
|---|---|
| 📥 Pipeline Management | Triage incoming applications across Pending, Under Review, Approved, and Rejected queues |
| 🔍 Candidate Dossier | Comprehensive inspection modal showing student background, GPA, resume link, and motivation |
| ⚡ One-Click Decisions | Instant approve/reject action buttons with automatic status notifications |
| 📊 Cohort Analytics | Aggregate breakdown of top represented universities, degree years, and geographical regions |
| 🏷️ Batch Operations | Filter candidates by college, country, status, or search query |

## 🤖 AI Growth Assistant (NVIDIA NIM)

The built-in AI assistant acts as a 24/7 campaign mentor for ambassadors, leveraging enterprise-grade LLM inference via NVIDIA NIM:

### 🎯 Suggested Prompts Supported

- "How do I explain zero forex markup on Niyo cards to study-abroad students?"
- "Draft a 3-slide pitch outline for our college finance club."
- "Create an Instagram caption announcement for our campus fintech workshop."
- "Suggest 5 engaging icebreaker games for our orientation desk."

## 🎨 Design System & UI Tokens

The user interface follows the Swiss Minimalist & Elevated Neumorphic design philosophy defined in design-system/MASTER.md:

### 🎨 Color Palette Tokens

| Variable | HEX Code | Swatch | Purpose |
|---|---|---|---|
| --purple | #4F35B5 | 🟣 | Primary brand color, key buttons, active tabs |
| --purple-dark | #39238E | 🟣 | Button hover states, high-contrast badges |
| --purple-soft | #F2EFFF | 🪻 | Icon containers, subtle pill tags, highlights |
| --navy | #17152F | 🌑 | Section headings, primary titles, footer background |
| --ink | #1E1B33 | 🖋️ | Primary body typography (WCAG AAA compliant) |
| --muted | #59566E | 🩶 | Subtitles, helper text, and secondary information |
| --white | #FFFFFF | ⚪ | Primary card surfaces and pure backgrounds |
| --line | #E5E0F7 | 📏 | Border boundaries, card dividers, subtle rules |

### 📐 Spatial Scale & Typography

- **Headings Font:** 'Manrope', sans-serif (Weights: 600, 700, 800)
- **Body Font:** 'DM Sans', sans-serif (Weights: 400, 500, 600)
- **Rhythm:** Strict 4px/8px modular spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px).
- **Elevation:** Multi-tier drop shadows (var(--shadow-sm) through var(--shadow-lg)).

## 📁 Project Directory Structure

```text
NIYO-STUDENT-AMBASSADOR/
├── .agents/skills/supabase-server/   # Supabase Edge function skill guides
├── asset/                            # High-resolution optimized imagery
│   ├── homepage1.png                 # Hero smiling student ambassador
│   └── homepage2.png                 # Campus community group visual
├── design-system/                    # Design tokens & UI specifications
│   └── MASTER.md                     # Single Source of Truth design manual
├── netlify/                          # Serverless functions for Netlify cloud
│   └── functions/
│       └── ai-assistant.mjs          # Production NVIDIA NIM endpoint
├── server/                           # Local API proxy server
│   └── aiHandler.js                  # Vite development AI handler
├── src/                              # React application source code
│   ├── AdminPortal.jsx               # Internal administrator dashboard
│   ├── adminService.js               # Application state & reviewer logic
│   ├── aiService.js                  # Client-side AI dispatch service
│   ├── AmbassadorPortal.jsx          # Approved ambassador workspace
│   ├── ambassadorService.js          # Peer directory & campaign resources
│   ├── ApplicationForm.jsx           # 3-step candidate application & country select
│   ├── Auth.jsx                      # Email/password & Google OAuth sign-in
│   ├── ProfileCompletion.jsx         # Post-OAuth student profile onboarding
│   ├── StudentDashboard.jsx         # Application tracker & student home
│   ├── styles.css                    # Master design system & responsive rules
│   ├── supabaseClient.js             # Supabase cloud database & auth client
│   └── main.jsx                      # App root, routing, navbar & bottom nav
├── countries.json                    # 195+ international countries dataset
├── index.html                        # Application entry HTML template
├── netlify.toml                      # Netlify build, routing & function config
├── package.json                      # Project manifest & dependencies
├── README.md                         # Project documentation
└── vite.config.js                    # Vite bundler plugins & server proxies
```

## 🔑 Environment Variables & Security

Create a .env file in the project root based on .env.example:

| Environment Variable | Required | Scope | Description |
|---|---|---|---|
| VITE_SUPABASE_URL | Yes | Client (VITE_) | Your Supabase project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Yes | Client (VITE_) | Supabase anon/publishable key |
| NVIDIA_API_KEY | Optional | Server Only | NVIDIA NIM API key for AI assistant |
| NVIDIA_MODEL | Optional | Server Only | Target NIM model (defaults to Nemotron) |
| NVIDIA_BASE_URL | Optional | Server Only | NVIDIA NIM API endpoint base URL |

⚠️ **CRITICAL SECURITY NOTICE:** Never prefix NVIDIA_API_KEY with VITE_. It must remain strictly server-side inside server/ or netlify/functions/ and must never be exposed to the browser bundle or committed to version control.

## 🚀 Quickstart & Installation

### 1️⃣ Prerequisites

- Node.js: v18.0.0 or higher
- npm: v9.0.0 or higher (bundled with Node.js)
- Git

### 2️⃣ Clone Repository

```bash
git clone https://github.com/Vishnu-cg2005/NIYO-STUDENT-AMBASSADOR.git
cd NIYO-STUDENT-AMBASSADOR
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Setup Environment

```bash
cp .env.example .env
# Open .env and add your Supabase / NVIDIA credentials
```

### 5️⃣ Run Local Development Server

```bash
npm run dev
```

Open your browser and navigate to http://localhost:5173.

### 6️⃣ Build for Production

```bash
npm run build
```

The optimized production bundle will be generated in the dist/ directory.

### 7️⃣ Preview Production Build Locally

```bash
npm run preview
```

## 🌍 Production Deployment

### 🔹 Option A: Vercel (Recommended)

1. Import repository on Vercel Dashboard.
2. Configure Framework Preset: Vite.
3. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY).
4. Click Deploy. Single-page routing rewrite is handled automatically.

### 🔹 Option B: Netlify

1. Connect repository on Netlify Dashboard.
2. Build command: npm run build | Publish directory: dist.
3. Serverless functions will deploy automatically via netlify/functions/ai-assistant.mjs.
4. Configure environment variables in Netlify site settings.

## 🧪 Testing & Quality Assurance

| Test Category | Scope | Verification Method | Status |
|---|---|---|---|
| Responsive Layouts | 320px, 375px, 768px, 1280px+ | Tested against iOS & Android viewports | ✅ Pass |
| Desktop Preservation | Full screen (1200px - 1920px) | Confirmed zero visual shifts or regressions | ✅ Pass |
| Country Select | All 195+ countries in countries.json | Tested selection, keyboard navigation, clear button | ✅ Pass |
| Form Drafts | Page reload during multi-step flow | Verified localStorage draft recovery | ✅ Pass |
| Duplicate Prevention | Submitting multiple times | Active application lock activates | ✅ Pass |
| Production Bundler | Full tree-shake and asset compression | Verified via npm run build (< 1.5s build time) | ✅ Pass |

## 🤝 Contributing & Code of Conduct

1. Fork the Repository on GitHub.
2. Create a Feature Branch: `git checkout -b feature/campus-enhancement`.
3. Commit Your Changes: `git commit -m "feat: enhance mobile touch controls"`.
4. Push to Your Branch: `git push origin feature/campus-enhancement`.
5. Open a Pull Request with a detailed explanation of changes.

💡 **Note:** When contributing, ensure that desktop styles remain strictly untouched and all mobile adjustments are scoped inside media queries.

## 📄 License & Disclaimers

- **License:** This project is open-source under the MIT License.
- **Disclaimer:** This portal is developed for the Niyo Campus Student Ambassador Program. All brand assets, logos, and trademarks belong to their respective owners. Product specifications and program benefits are subject to official Niyo policies.

---

Built with 💜 for Student Leaders across the Globe

*Niyo Campus Student Ambassador Program • Connecting University Communities*
