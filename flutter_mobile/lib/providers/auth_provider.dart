import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../services/api_service.dart';
import '../config/google_auth_config.dart';

import '../services/notification_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  // Configure Google Sign In with platform-specific client IDs
  late final GoogleSignIn _googleSignIn = _createGoogleSignIn();
  
  GoogleSignIn _createGoogleSignIn() {
    if (Platform.isIOS && GoogleAuthConfig.iosClientId != null) {
      return GoogleSignIn(
        scopes: ['email', 'profile'],
        clientId: GoogleAuthConfig.iosClientId,
        // serverClientId should be the Web client id (used to mint idToken for backend verification)
        serverClientId: GoogleAuthConfig.webClientId,
      );
    } else if (Platform.isAndroid) {
      return GoogleSignIn(
        scopes: ['email', 'profile'],
        // IMPORTANT: this must be the *Web* client id. Do NOT use the Android client id here.
        // Using a WEB client id as an iOS client id causes: "Custom scheme URIs are not allowed for 'WEB' client type."
        serverClientId: GoogleAuthConfig.webClientId,
      );
    } else {
      // Default configuration (will use default client ID from google-services.json or GoogleService-Info.plist)
      return GoogleSignIn(
        scopes: ['email', 'profile'],
      );
    }
  }
  
  AuthProvider() {
    _loadAuthState();
  }
  
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _token;
  Map<String, dynamic>? _user;
  String? _error;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  String? get error => _error;


  Future<void> _loadAuthState() async {
    final prefs = await SharedPreferences.getInstance();
    final savedToken = prefs.getString('auth_token');
    final savedUserJson = prefs.getString('user_data');
    
    if (savedToken != null && savedUserJson != null) {
      _token = savedToken;
      // User data will be loaded from API when needed
      // TODO: Fetch full user profile to get ID if not stored
      // For now we assume we might need to fetch profile if we don't store ID in shared prefs
      // Or we can rely on login response to store user data properly
      
      // Attempt to load user from saved json if meaningful (logic simplified here)
      // Ideally we should do: _user = jsonDecode(savedUserJson); 
      // But _user was initialized to {} in previous code.
      // Let's assume we can fetch profile or try to connect if we have ID.
      
      _user = {}; 
      _isAuthenticated = true;
      _apiService.setToken(savedToken);
      
      // Ideally fetch profile here to get ID for socket
       try {
         final profile = await _apiService.getUserProfile();
         if (profile != null) {
           _user = profile;
           NotificationService().connect(_user!['id']);
         }
       } catch (e) {
         print("Error fetching profile on load: $e");
       }
      
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.login(email, password);
      
      if (response['success'] == true) {
        _token = response['token'];
        _user = response['user'];
        _isAuthenticated = true;
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        // User data will be stored as needed
        
        _apiService.setToken(_token!);
        
        // Connect Socket
        if (_user != null && _user!['id'] != null) {
           NotificationService().connect(_user!['id']);
        }
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signup(String firstName, String lastName, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.signup(firstName, lastName, email, password);
      
      if (response['success'] == true) {
        _token = response['token'];
        _user = response['user'];
        _isAuthenticated = true;
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        // User data will be stored as needed
        
        _apiService.setToken(_token!);
        
        // Connect Socket
        if (_user != null && _user!['id'] != null) {
           NotificationService().connect(_user!['id']);
        }

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Signup failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signInWithGoogle() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Sign in with Google
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        // User cancelled the sign-in
        _isLoading = false;
        notifyListeners();
        return false;
      }

      // Get the authentication token
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Some platforms/configs return only idToken. Backend supports both.
      final tokenToSend = googleAuth.idToken ?? googleAuth.accessToken;
      if (tokenToSend == null) {
        _error = 'Failed to get Google token (idToken/accessToken)';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      // Send token to backend for verification (accepts idToken or accessToken)
      final response = await _apiService.googleLogin(tokenToSend);
      
      if (response['success'] == true) {
        _token = response['token'];
        _user = response['user'];
        _isAuthenticated = true;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        
        _apiService.setToken(_token!);
        
        // Connect Socket
        if (_user != null && _user!['id'] != null) {
           NotificationService().connect(_user!['id']);
        }

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Google login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Google sign in failed: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _googleSignIn.signOut();
    
    NotificationService().disconnect();

    _isAuthenticated = false;
    _token = null;
    _user = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
    
    _apiService.setToken(null);
    notifyListeners();
  }
}

