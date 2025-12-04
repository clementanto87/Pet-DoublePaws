# 🐾 Double Paws Mobile App

A premium, world-class React Native mobile application for the Double Paws pet care platform.

## ✨ Features

- **Beautiful UI**: Premium design with smooth animations and professional aesthetics
- **Easy Navigation**: Intuitive bottom tab navigation and seamless screen transitions
- **Search & Discovery**: Find trusted pet sitters near you with powerful filters
- **Booking System**: Multi-step booking flow with real-time pricing
- **User Authentication**: Secure login and registration with validation
- **Profile Management**: Complete user profiles with pets and booking history
- **Become a Sitter**: Registration flow for pet sitters

## 🛠 Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Native Reanimated** for smooth animations
- **Expo Image** for optimized image loading
- **Expo Location** for location services
- **Axios** for API communication

## 📱 Screens

1. **Home Screen** - Landing page with services and CTA
2. **Search Screen** - Search and filter sitters
3. **Sitter Profile** - Detailed sitter information
4. **Booking Screen** - Multi-step booking process
5. **Login/Signup** - Authentication screens
6. **Profile** - User profile and settings
7. **Become a Sitter** - Sitter registration landing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web (for testing)
npx expo start --web
```

## 📁 Project Structure

```
mobile/
├── App.tsx                 # Main app entry
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── src/
│   ├── components/
│   │   └── ui/            # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       └── Avatar.tsx
│   ├── screens/           # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── SitterProfileScreen.tsx
│   │   ├── BookingScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── BecomeSitterScreen.tsx
│   ├── navigation/        # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── theme/             # Theme and styling
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── services/          # API services
│   │   └── api.ts
│   ├── context/           # React Context
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom hooks
│   │   └── useLocation.ts
│   └── utils/             # Utility functions
│       └── helpers.ts
└── assets/                # Images and fonts
```

## 🎨 Design System

### Colors

- **Primary**: Orange (#F97316) - Brand color
- **Secondary**: Blue (#3B82F6) - Accents
- **Success**: Green (#10B981) - Positive states
- **Warning**: Amber (#F59E0B) - Warnings
- **Error**: Red (#EF4444) - Errors

### Typography

- Headers: Bold (700-800 weight)
- Body: Regular (400-500 weight)
- Scale: xs(12), sm(14), md(16), lg(18), xl(20), 2xl(24), 3xl(30), 4xl(36)

### Spacing

- xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, 3xl: 32, 4xl: 40

## 📦 Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

## 🔧 Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 📄 License

This project is proprietary to Double Paws.

---

Built with ❤️ for pet lovers everywhere 🐾

