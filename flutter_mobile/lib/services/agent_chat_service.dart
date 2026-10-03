import 'dart:convert';
import 'package:http/http.dart' as http;

class AgentChatService {
  final String baseUrl;
  String? _sessionId;

  AgentChatService({required this.baseUrl});

  String? get sessionId => _sessionId;

  Future<String> sendMessage(String prompt, {String agent = 'claude-code', String? model}) async {
    final body = <String, dynamic>{
      'prompt': prompt,
      'agent': agent,
      'workspace': '/root/workspace/pet',
    };
    if (_sessionId != null) body['session_id'] = _sessionId!;
    if (model != null) body['model'] = model;

    final request = http.Request('POST', Uri.parse('$baseUrl/api/chat'))
      ..headers['Content-Type'] = 'application/json'
      ..body = jsonEncode(body);

    final streamed = await http.Client().send(request);

    _sessionId ??= streamed.headers['x-session-id'];

    final buffer = StringBuffer();
    await for (final chunk in streamed.stream.transform(utf8.decoder)) {
      buffer.write(chunk);
    }

    final raw = buffer.toString().trim();
    if (raw.isEmpty) return 'No response from agent.';

    final lines = raw.split('\n');
    final textParts = <String>[];
    for (final line in lines) {
      final trimmed = line.trim();
      if (trimmed.isEmpty) continue;
      try {
        final map = jsonDecode(trimmed);
        if (map is Map) {
          if (map['type'] == 'text' || map['type'] == 'content') {
            textParts.add(map['text'] ?? map['content'] ?? '');
          } else if (map['text'] != null) {
            textParts.add(map['text']);
          }
        }
      } catch (_) {
        textParts.add(trimmed);
      }
    }
    return textParts.join().trim().isEmpty ? raw : textParts.join().trim();
  }

  void resetSession() {
    _sessionId = null;
  }
}
