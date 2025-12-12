import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../services/api_service.dart';
import '../config/google_auth_config.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  // Configure Google Sign In with platform-specific client IDs
  late final GoogleSignIn _googleSignIn = _createGoogleSignIn();
  
  GoogleSignIn _createGoogleSignIn() {
    if (Platform.isIOS && GoogleAuthConfig.iosClientId != null) {
      return GoogleSignIn(
        scopes: ['email', 'profile'],
        clientId: GoogleAuthConfig.iosClientId,
      );
    } else if (Platform.isAndroid && GoogleAuthConfig.androidClientId != null) {
      return GoogleSignIn(
        scopes: ['email', 'profile'],
        serverClientId: GoogleAuthConfig.androidClientId,
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
      _user = {};
      _isAuthenticated = true;
      _apiService.setToken(savedToken);
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

      if (googleAuth.accessToken == null) {
        _error = 'Failed to get Google access token';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      // Send access token to backend for verification
      final response = await _apiService.googleLogin(googleAuth.accessToken!);
      
      if (response['success'] == true) {
        _token = response['token'];
        _user = response['user'];
        _isAuthenticated = true;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        
        _apiService.setToken(_token!);
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

