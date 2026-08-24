# Watch Box ⌚

> A modern horology vault, accuracy rate lab, WOTD rotation tracker, and strap studio built for watch collectors and enthusiasts.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119eff.svg)](https://capacitorjs.com/)

---

## ✨ Features

- **💼 Interactive Watch Box & Vault**
  - Realistic 6-slot collector case view with genuine cushion pillows.
  - Live animated sweeping mechanical seconds dials rendered at caliber beat frequency.
  - Real-time market value totals, piece counts, and amortized cost-per-wear analytics.

- **⏱️ Accuracy & Timing Rate Lab (COSC / METAS)**
  - Precision NIST atomic reference clock benchmark.
  - Multi-positional timing drift tracking: Dial Up, Crown Down, Dial Down, Crown Up, Crown Left, Crown Right.
  - Instant rate calculation ($\pm$ s/day), beat error (ms), amplitude (°), and positional variance.

- **📅 Watch of the Day (WOTD) & Wear Tracker**
  - Daily wrist check logger with companion strap selections and collector notes.
  - Wear frequency distribution, rotation streak counter, and cost-per-wear insights.

- **🧵 Strap Workshop & Interactive Fitting Studio**
  - Live strap mounting visualizer with automatic lug width compatibility checks (18mm, 19mm, 20mm, 21mm, 22mm).
  - Custom strap wardrobe organizer supporting Quick Release, water resistance, and material tags.

- **📸 Wrist Scanner & Horology Photo Gallery**
  - Camera capture and gallery photo upload for wrist checks and macro shots.
  - Itemized timepiece dossier links directly accessible from high-resolution photos.

- **🛡️ Insurance Appraisal Certificate**
  - Printable valuation summary with itemized schedule of insured articles.
  - One-click serial number masking/revealing for privacy.

- **📱 Android & Mobile Ready**
  - Native Capacitor 8 integration for Android 11+ (`com.watchbox.horology`).
  - Fluid mobile-first gestures, draggable bottom sheets, and responsive touch targets.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler & Tooling**: Vite 6, TSX, ESLint, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Motion & Charts**: Motion (`motion/react`), Recharts, Canvas Confetti
- **Mobile Engine**: Capacitor 8 (Android)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- *(Optional for Android build)* [Android Studio](https://developer.android.com/studio) with SDK 30+ (Android 11+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/watch-box.git
   cd watch-box
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server at `http://localhost:3000` |
| `npm run build` | Compiles TypeScript and builds production assets to `/dist` |
| `npm run lint` | Type-checks code with `tsc --noEmit` |
| `npm run cap:sync` | Builds web assets and syncs them to the Android Capacitor project |
| `npm run preview` | Previews the production build locally |

---

## 📱 Building for Android

1. Build web assets and sync with Capacitor:
   ```bash
   npm run cap:sync
   ```

2. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```

3. Run or generate an APK/AAB bundle in Android Studio (`Build` > `Build Bundle(s) / APK(s)`).

---

## 🌿 Pushing to GitHub

Initialize git, commit your files, and push to your remote repository:

```bash
# 1. Initialize git repository (if not already initialized)
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "feat: initial commit of Watch Box horology vault application"

# 4. Link your GitHub remote repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/watch-box.git

# 5. Push to GitHub
git push -u origin main
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
