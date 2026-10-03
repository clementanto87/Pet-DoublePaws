import 'package:flutter/services.dart';

class FloatingAssistantService {
  static const _channel = MethodChannel('com.doublepaws/floating_assistant');
  static VoidCallback? onBubbleTapped;

  static void init() {
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onBubbleTapped') {
        onBubbleTapped?.call();
      }
    });
  }

  static Future<bool> showBubble() async {
    final result = await _channel.invokeMethod<bool>('showBubble');
    return result ?? false;
  }

  static Future<void> hideBubble() async {
    await _channel.invokeMethod('hideBubble');
  }

  static Future<bool> hasOverlayPermission() async {
    final result = await _channel.invokeMethod<bool>('hasOverlayPermission');
    return result ?? false;
  }
}
