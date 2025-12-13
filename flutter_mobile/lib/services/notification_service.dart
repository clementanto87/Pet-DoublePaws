import 'dart:async';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'api_service.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  IO.Socket? _socket;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  bool _isInitialized = false;

  // Stream for new messages
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;

  // Track current chat partner to suppress notifications
  String? currentChatPartnerId;

  Future<void> init() async {
    if (_isInitialized) return;

    // Initialize Local Notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const initSettings = InitializationSettings(android: androidSettings, iOS: iosSettings);
    await _localNotifications.initialize(initSettings);

    _isInitialized = true;
    print('NotificationService initialized');
  }

  void connect(String userId) {
    if (_socket != null && _socket!.connected) return;

    // Remove /api from base URL for socket connection
    final baseUrl = ApiService.baseUrl.replaceAll('/api', '');
    
    _socket = IO.io(baseUrl, IO.OptionBuilder()
        .setTransports(['websocket'])
        .enableAutoConnect()
        .build());

    _socket!.onConnect((_) {
      print('Socket Connected: ${_socket!.id}');
      _socket!.emit('join_user', userId);
    });

    _socket!.onDisconnect((_) => print('Socket Disconnected'));

    // Listen for events
    _socket!.on('new_booking', (data) {
      print('New Booking Received: $data');
      _showNotification(
        id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
        title: 'New Booking Request',
        body: data['message'] ?? 'You have a new booking request!',
      );
    });

    _socket!.on('new_message', (data) {
      print('New Message Received: $data');
      
      // Broadcast to app
      _messageController.add(data);

      // Only show notification if we are NOT currently chatting with this user
      if (currentChatPartnerId != data['senderId']) {
        _showNotification(
          id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
          title: 'New Message from ${data['senderName']}',
          body: data['message'] ?? 'You have a new message',
        );
      }
    });
    
    _socket!.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
  
  void dispose() {
    _messageController.close();
  }

  Future<void> _showNotification({required int id, required String title, required String body}) async {
    const androidDetails = AndroidNotificationDetails(
      'pet_daycare_channel',
      'Pet Daycare Notifications',
      importance: Importance.max,
      priority: Priority.high,
    );
    const iosDetails = DarwinNotificationDetails();
    
    const details = NotificationDetails(android: androidDetails, iOS: iosDetails);
    
    await _localNotifications.show(id, title, body, details);
  }
}
