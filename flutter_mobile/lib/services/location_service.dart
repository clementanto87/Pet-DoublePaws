import 'package:geocoding/geocoding.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class LocationService {
  // Using OpenStreetMap Nominatim API for location autocomplete (free, no API key needed)
  static const String _nominatimBaseUrl = 'https://nominatim.openstreetmap.org/search';

  /// Search for location suggestions using OpenStreetMap Nominatim
  static Future<List<LocationSuggestion>> searchLocations(String query) async {
    if (query.trim().isEmpty || query.length < 2) {
      return [];
    }

    try {
      final uri = Uri.parse(_nominatimBaseUrl).replace(
        queryParameters: {
          'q': query,
          'format': 'json',
          'limit': '5',
          'addressdetails': '1',
          'countrycodes': 'us,de', // US and Germany locations
        },
      );

      final response = await http.get(
        uri,
        headers: {
          'User-Agent': 'DoublePawsApp/1.0', // Required by Nominatim
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((item) {
          final address = item['address'] as Map<String, dynamic>?;
          final lat = item['lat'];
          final lon = item['lon'];
          
          return LocationSuggestion(
            displayName: item['display_name'] as String? ?? query,
            fullAddress: item['display_name'] as String? ?? '',
            city: address?['city'] as String? ?? 
                  address?['town'] as String? ?? 
                  address?['village'] as String? ?? 
                  address?['municipality'] as String? ?? '',
            state: address?['state'] as String? ?? 
                   address?['region'] as String? ?? '',
            country: address?['country'] as String? ?? '',
            latitude: lat is num ? lat.toDouble() : double.tryParse(lat?.toString() ?? '') ?? 0.0,
            longitude: lon is num ? lon.toDouble() : double.tryParse(lon?.toString() ?? '') ?? 0.0,
          );
        }).toList();
      }
    } catch (e) {
      // Silently fail - return empty list
      debugPrint('Location search error: $e');
      return [];
    }

    return [];
  }

  /// Get location from coordinates (reverse geocoding)
  static Future<LocationSuggestion?> getLocationFromCoordinates(
    double latitude,
    double longitude,
  ) async {
    try {
      final placemarks = await placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        return LocationSuggestion(
          displayName: _formatAddress(place),
          fullAddress: _formatAddress(place),
          city: place.locality ?? place.subAdministrativeArea ?? '',
          state: place.administrativeArea ?? '',
          country: place.country ?? '',
          latitude: latitude,
          longitude: longitude,
        );
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  static String _formatAddress(Placemark place) {
    final parts = <String>[];
    if (place.street != null) parts.add(place.street!);
    if (place.locality != null) parts.add(place.locality!);
    if (place.administrativeArea != null) parts.add(place.administrativeArea!);
    if (place.country != null) parts.add(place.country!);
    return parts.join(', ');
  }
}

class LocationSuggestion {
  final String displayName;
  final String fullAddress;
  final String city;
  final String state;
  final String country;
  final double latitude;
  final double longitude;

  LocationSuggestion({
    required this.displayName,
    required this.fullAddress,
    required this.city,
    required this.state,
    required this.country,
    required this.latitude,
    required this.longitude,
  });

  String get shortDisplay {
    if (city.isNotEmpty && state.isNotEmpty) {
      return '$city, $state';
    } else if (city.isNotEmpty) {
      return city;
    } else if (state.isNotEmpty) {
      return state;
    }
    return displayName;
  }
}

