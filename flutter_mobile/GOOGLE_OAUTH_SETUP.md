# Google OAuth Setup Guide

## Quick Setup (Recommended)

### Step 1: Get Google OAuth Client IDs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Google+ API** (or Google Identity API)
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**

### Step 2: Create OAuth Clients

Create **two** OAuth 2.0 Client IDs:

1. **iOS Client:**
   - Application type: **iOS**
   - Bundle ID: `com.doublepaws.double_paws` (from your app)
   - Copy the **Client ID** (format: `xxxxx-xxxxx.apps.googleusercontent.com`)

2. **Android Client:**
   - Application type: **Android**
   - Package name: `com.doublepaws.double_paws`
   - SHA-1 certificate fingerprint (get it using command below)
   - Copy the **Client ID**

### Step 3: Get Android SHA-1 Fingerprint

```bash
cd android
./gradlew signingReport
```

Look for `SHA1:` in the debug variant output.

### Step 4: Configure Flutter App

#### Option A: Using Configuration File (Recommended)

1. Open `lib/config/google_auth_config.dart`
2. Set your client IDs:
   ```dart
   static const String? iosClientId = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
   static const String? androidClientId = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
   ```

#### Option B: Using Firebase (Alternative)

1. Create a Firebase project
2. Add iOS and Android apps
3. Download configuration files:
   - `GoogleService-Info.plist` → Place in `ios/Runner/`
   - `google-services.json` → Place in `android/app/`
4. The app will automatically detect client IDs from these files

### Step 5: iOS Configuration

Add URL scheme to `ios/Runner/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

Replace `YOUR_CLIENT_ID` with your iOS client ID (the part before `.apps.googleusercontent.com`).

### Step 6: Android Configuration

Add to `android/app/src/main/AndroidManifest.xml` (inside `<application>` tag):

```xml
<meta-data
    android:name="com.google.android.gms.auth.GOOGLE_CLIENT_ID"
    android:value="YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com"/>
```

### Step 7: Test

1. Run the app: `flutter run`
2. Click "Sign in with Google" or "Sign up with Google"
3. Select your Google account
4. Should authenticate and navigate to home

## Troubleshooting

### "Sign in failed" or "PlatformException"
- Verify client IDs are correct
- Check that OAuth consent screen is configured
- Ensure SHA-1 fingerprint is added for Android

### "Network error"
- Check backend is running at `http://192.168.1.118:5001`
- Verify `/api/auth/google` endpoint is accessible

### iOS: "redirect_uri_mismatch"
- Check URL scheme in Info.plist matches client ID
- Format: `com.googleusercontent.apps.CLIENT_ID_PREFIX`

### Android: "DEVELOPER_ERROR"
- Verify SHA-1 fingerprint is added in Google Cloud Console
- Check package name matches: `com.doublepaws.double_paws`

## Current Backend Integration

The app sends the Google access token to:
- **Endpoint**: `POST /api/auth/google`
- **Body**: `{ "token": "google_access_token" }`
- **Response**: `{ "token": "jwt_token", "user": {...} }`

The backend verifies the token and returns a JWT for your app.
