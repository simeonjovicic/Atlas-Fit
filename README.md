# Atlas Fit - Workout Tracker App

Eine moderne Fitness-Tracking-App entwickelt mit **Ionic Framework**, **Vue.js 3** und **Firebase**.

## 🚀 Features

- ✅ **Benutzer-Authentifizierung** (Email/Password + Google)
- ✅ **Workout-Management** - Workouts erstellen, bearbeiten und löschen
- ✅ **1200+ Übungen** - Große Datenbank mit verschiedenen Übungen
- ✅ **Workout-Durchführung** - Timer, Sets, Reps & Gewicht tracking
- ✅ **Statistiken & Analytics** - Streaks, Verlauf, Charts
- ✅ **Profilverwaltung** - Persönliche Daten und Körpermaße
- ✅ **Responsive Design** - Phone & Tablet optimiert
- ✅ **Offline-fähig** - Firebase Offline-Persistenz
- ✅ **PWA** - Installierbar als Progressive Web App

## 🛠 Tech Stack

- **Frontend:** Ionic Framework 8 + Vue.js 3 + TypeScript
- **Backend:** Firebase (Firestore + Auth)
- **Build Tool:** Vite
- **Mobile:** Capacitor 7
- **Testing:** Cypress (E2E Tests)

## 📋 Installation

```bash
# Dependencies installieren
npm install

# Firebase Config in src/services/firebase.ts eintragen

# Development Server starten
npm run dev
```

## 🧪 Testing

```bash
# E2E Tests
npm run test:e2e

# Linting
npm run lint
```

## 📱 Build

```bash
# Production Build
npm run build

# Android Build
npx cap sync android
npx cap open android

# iOS Build (nur macOS)
npx cap sync ios
npx cap open ios
```

## 📁 Projektstruktur

```
src/
├── services/     # Firebase Services (Auth, Firestore)
├── views/        # Vue Pages
├── components/   # Wiederverwendbare Komponenten
├── router/       # Vue Router
└── theme/        # Styles

tests/
└── e2e/          # Cypress E2E Tests
```

## 🔐 Security

Alle Daten sind user-spezifisch und durch Firestore Security Rules geschützt. User können nur ihre eigenen Daten lesen/schreiben.

## 📄 Lizenz

Entwickelt im Rahmen des WMC Projekts an der HTL.

---

**Viel Erfolg beim Training! 💪**

