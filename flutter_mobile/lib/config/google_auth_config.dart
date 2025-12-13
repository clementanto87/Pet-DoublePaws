// Google OAuth Configuration
// Replace these with your actual Google OAuth Client IDs from Google Cloud Console

class GoogleAuthConfig {
  // iOS Client ID (from Google Cloud Console - iOS OAuth client)
  // Format: xxxxxx-xxxxx.apps.googleusercontent.com
  //
  // IMPORTANT:
  // - This MUST be an OAuth client of type **iOS** (not Web).
  // - If you use a Web client ID here, you'll get:
  //   "Custom scheme URIs are not allowed for 'WEB' client type."
  static const String? iosClientId = null; // TODO: set your iOS client id
  
  // Android Client ID (from Google Cloud Console - Android OAuth client)
  // Format: xxxxxx-xxxxx.apps.googleusercontent.com
  // Usually you don't need to set this in code. Android uses package name + SHA-1 config.
  static const String? androidClientId = null;
  
  // Web Client ID (used as `serverClientId` to mint an idToken for backend verification)
  static const String? webClientId = '148696767812-0m22i59jnp90ejdr9gp6itg52svthbqg.apps.googleusercontent.com';
}

