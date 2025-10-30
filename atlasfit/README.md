# Atlas Fit - Workout Tracker App

Eine moderne Fitness-Tracking-App entwickelt mit **Ionic Framework**, **Vue.js 3** und **Firebase**.

## 🚀 Features

### Aktuelle Features (Phase 1 - Profile Integration)
- ✅ **Benutzer-Authentifizierung**
  - Email/Password Login & Registrierung
  - Google Sign-In
  - Persistente Sessions
  - Geschützte Routes

- ✅ **Profilverwaltung**
  - Persönliche Daten (Name, Gewicht, Größe)
  - Körpermaße-Tracking
  - Profilbild-Upload (Base64 in Firestore - kostenfrei)
  - Historische Daten-Tracking

- ✅ **Workout-Management** (localStorage - Migration zu Firebase geplant)
  - Workout-Erstellung & -Bearbeitung
  - 1200+ Übungen-Datenbank
  - Workout-Durchführung mit Timer
  - Sets, Reps & Gewicht-Tracking

- ✅ **Statistiken & Analytics**
  - Workout-Streak-Tracking
  - Monatliche Statistiken
  - Verlaufs-Übersicht
  - Fortschritts-Charts

- ✅ **Weitere Features**
  - Responsive Design (Phone & Tablet)
  - Dark Mode Support
  - Offline-fähig (PWA)
  - Push-Benachrichtigungen
  - Daten Export/Import

## 🛠 Tech Stack

- **Frontend:** Ionic Framework 8 + Vue.js 3
- **Language:** TypeScript
- **Build Tool:** Vite
- **Backend:** Firebase
  - Authentication (Email/Password + Google)
  - Firestore Database (inkl. Base64 Profilbilder)
- **Mobile:** Capacitor 7 (Android/iOS Support)
- **Testing:** Vitest (Unit) + Cypress (E2E)

## 📋 Voraussetzungen

- Node.js (v18 oder höher)
- npm oder yarn
- Firebase Account

## 🔧 Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd atlasfit
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Firebase Setup
Folge der Anleitung in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) um:
- Firebase Projekt zu konfigurieren
- Firestore Database einzurichten
- Authentication zu aktivieren
- ~~Storage~~ (nicht benötigt - Bilder werden in Firestore gespeichert)

### 4. Firebase Config eintragen
Bearbeite `src/services/firebase.ts` und füge deine Firebase-Konfiguration ein:

```typescript
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

## 🚀 Entwicklung

### Development Server starten
```bash
npm run dev
```
App läuft auf: http://localhost:5173

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

## 📱 Mobile Development

### Android
```bash
# Sync mit Capacitor
npx cap sync android

# Android Studio öffnen
npx cap open android
```

### iOS (nur macOS)
```bash
# Sync mit Capacitor
npx cap sync ios

# Xcode öffnen
npx cap open ios
```

## 📁 Projektstruktur

```
atlasfit/
├── src/
│   ├── services/          # Firebase & Business Logic
│   │   ├── firebase.ts    # Firebase Initialisierung
│   │   ├── authService.ts # Authentication
│   │   └── profileService.ts # Profile & Storage
│   ├── views/             # Haupt-Pages
│   │   ├── LoginPage.vue
│   │   ├── RegisterPage.vue
│   │   ├── HomePage.vue
│   │   ├── ProfileView.vue
│   │   ├── CreateWorkouts.vue
│   │   ├── SearchWorkouts.vue
│   │   └── WorkoutExecution.vue
│   ├── components/        # Wiederverwendbare Komponenten
│   ├── router/            # Vue Router Konfiguration
│   ├── theme/             # CSS Variablen & Styles
│   └── resources/         # Statische Assets
├── tests/
│   ├── unit/              # Unit Tests
│   └── e2e/               # E2E Tests (Cypress)
├── public/                # Öffentliche Assets
└── capacitor.config.ts    # Capacitor Konfiguration
```

## 🔐 Security

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Hinweis zu Profilbildern
Profilbilder werden als **Base64-Strings direkt in Firestore** gespeichert, um Firebase Storage-Kosten zu vermeiden. Die Bildgröße ist auf 500KB begrenzt, um innerhalb der Firestore-Limits zu bleiben.

## 🗺 Roadmap

### Phase 2 - Workout Migration (Geplant)
- [ ] Workouts zu Firestore migrieren
- [ ] Workout-Historie zu Firestore migrieren
- [ ] Multi-Device Sync
- [ ] Workout-Templates teilen

### Phase 3 - Erweiterte Features (Geplant)
- [ ] Social Features (Freunde, Leaderboards)
- [ ] Ernährungs-Tracking
- [ ] KI-basierte Workout-Empfehlungen
- [ ] Apple Health / Google Fit Integration
- [ ] Internationalisierung (i18n)

## 📄 Lizenz

[Lizenz hier einfügen]

## 👥 Team

Entwickelt im Rahmen des WMC Projekts an der HTL.

## 🤝 Beitragen

Contributions sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue.

## 📞 Support

Bei Fragen oder Problemen:
- Issue erstellen: [GitHub Issues]
- Firebase Docs: https://firebase.google.com/docs

---

**Viel Erfolg beim Training! 💪**

