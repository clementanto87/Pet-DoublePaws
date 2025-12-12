# Double Paws - Flutter Mobile App

A Flutter mobile application for the Double Paws pet daycare platform.

## Features

- User authentication (Login/Signup)
- Search for pet sitters
- View bookings
- User profile management
- Bottom navigation

## Setup

1. Make sure Flutter is installed:
   ```bash
   flutter --version
   ```

2. Install dependencies:
   ```bash
   cd flutter_mobile
   flutter pub get
   ```

3. Update API base URL in `lib/services/api_service.dart`:
   ```dart
   static const String baseUrl = 'http://YOUR_BACKEND_URL:PORT/api';
   ```

## Running the App

### iOS
```bash
flutter run -d ios
```

### Android
```bash
flutter run -d android
```

### Web
```bash
flutter run -d chrome
```

## Project Structure

```
lib/
├── main.dart              # App entry point
├── providers/             # State management (Provider)
│   └── auth_provider.dart
├── screens/               # App screens
│   ├── login_screen.dart
│   ├── home_screen.dart
│   ├── search_screen.dart
│   ├── bookings_screen.dart
│   └── profile_screen.dart
├── services/              # API services
│   └── api_service.dart
├── models/               # Data models
├── widgets/              # Reusable widgets
└── utils/                # Utility functions
```

## Dependencies

- `go_router`: Navigation
- `provider`: State management
- `http`: HTTP requests
- `shared_preferences`: Local storage
- `geolocator`: Location services
- `cached_network_image`: Image caching

## Backend API

The app connects to the backend API at `http://192.168.1.118:5001/api`

Make sure the backend is running and accessible from your device/emulator.
