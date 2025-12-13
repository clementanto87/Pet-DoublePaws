import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:5001/api';
    if (Platform.isAndroid) return 'http://10.0.2.2:5001/api';
    return 'http://127.0.0.1:5001/api'; // iOS Simulator uses localhost
  }
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/login'),
        headers: _headers,
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'token': data['token'],
          'user': data['user'],
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? 'Login failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  Future<Map<String, dynamic>> signup(
    String firstName,
    String lastName,
    String email,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/signup'),
        headers: _headers,
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'token': data['token'],
          'user': data['user'],
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? 'Signup failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  Future<Map<String, dynamic>> googleLogin(String token) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/google'),
        headers: _headers,
        body: jsonEncode({
          'token': token,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'token': data['token'],
          'user': data['user'],
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? 'Google login failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  Future<List<dynamic>> searchSitters({
    String? location,
    String? service,
    double? latitude,
    double? longitude,
    double? minPrice,
    double? maxPrice,
    double? minRating,
    double? maxDistance,
    double? minExperience,
    bool? verifiedOnly,
    bool? hasReviews,
    List<String>? serviceTypes,
  }) async {
    try {
      // Match the web portal + backend expectations.
      // For single serviceType, we send the backend key directly so filtering works reliably.
      const serviceTypeMap = <String, String>{
        'boarding': 'boarding',
        'housesitting': 'houseSitting',
        'visits': 'dropInVisits',
        'daycare': 'doggyDayCare',
        'walking': 'dogWalking',
      };

      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/sitters/search'),
        headers: _headers,
        body: jsonEncode({
          if (location != null) 'location': location,
          if (service != null) 'serviceType': serviceTypeMap[service] ?? service,
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          // Advanced filters (same contract as web)
          if (minPrice != null) 'minPrice': minPrice,
          if (maxPrice != null) 'maxPrice': maxPrice,
          if (minRating != null) 'minRating': minRating,
          if (maxDistance != null) 'maxDistance': maxDistance,
          if (minExperience != null) 'minExperience': minExperience,
          if (verifiedOnly == true) 'verifiedOnly': 'true',
          if (hasReviews == true) 'hasReviews': 'true',
          if (serviceTypes != null && serviceTypes.isNotEmpty)
            'serviceTypes': serviceTypes.join(','),
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<dynamic>.from(data);
      } else {
        return [];
      }
    } catch (e) {
      debugPrint('Error searching sitters: $e');
      return [];
    }
  }

  Future<List<dynamic>> getBookings() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/bookings'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<dynamic>.from(data);
      } else {
        return [];
      }
    } catch (e) {
      debugPrint('Error fetching bookings: $e');
      return [];
    }
  }

  Future<bool> updateBookingStatus(String bookingId, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('${ApiService.baseUrl}/bookings/$bookingId/status'),
        headers: _headers,
        body: jsonEncode({'status': status}),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating booking status: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/bookings'),
        headers: _headers,
        body: jsonEncode(bookingData),
      );

      if (response.statusCode == 201) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        final error = jsonDecode(response.body);
        return {'success': false, 'message': error['message'] ?? 'Booking failed'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  Future<List<dynamic>> getConversations() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/messages/conversations'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching conversations: $e');
      return [];
    }
  }

  Future<List<dynamic>> getConversation(String otherUserId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/messages/conversation/$otherUserId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching conversation: $e');
      return [];
    }
  }

  Future<bool> sendMessage({
    required String receiverId,
    String? content,
    String? imageUrl,
    String? bookingId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/messages'),
        headers: _headers,
        body: jsonEncode({
          'receiverId': receiverId,
          if (content != null) 'content': content,
          if (imageUrl != null) 'imageUrl': imageUrl,
          if (bookingId != null) 'bookingId': bookingId,
        }),
      );

      return response.statusCode == 201;
    } catch (e) {
      debugPrint('Error sending message: $e');
      return false;
    }
  }
  Future<List<dynamic>> getPets() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/pets'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return List<dynamic>.from(jsonDecode(response.body));
      } else {
        return [];
      }
    } catch (e) {
      debugPrint('Error fetching pets: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/auth/me'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return null; // Token might be invalid or expired
      }
    } catch (e) {
      debugPrint('Error fetching user profile: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> getSitterProfile() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/sitters/me'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return null;
      }
    } catch (e) {
      debugPrint('Error fetching sitter profile: $e');
      return null;
    }
  }
}

