import 'dart:io';
import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import '../services/agent_chat_service.dart';
import '../widgets/assistant_avatar.dart';

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> with TickerProviderStateMixin {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();
  final _messages = <_ChatMsg>[];
  late final AgentChatService _agent;
  bool _loading = false;
  bool _listening = false;
  late AnimationController _avatarPulse;
  final _speech = stt.SpeechToText();
  final _tts = FlutterTts();
  bool _speechAvailable = false;

  static String get _agentBaseUrl {
    if (Platform.isAndroid) return 'http://10.0.2.2:7800';
    return 'http://127.0.0.1:7800';
  }

  @override
  void initState() {
    super.initState();
    _agent = AgentChatService(baseUrl: _agentBaseUrl);
    _avatarPulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat(reverse: true);
    _messages.add(_ChatMsg(
      text: "Hey! I'm your assistant. Ask me anything — I can check your bookings, find sitters, or help with your pets. Tap the mic to talk!",
      isUser: false,
    ));
    _initSpeech();
    _initTts();
  }

  Future<void> _initSpeech() async {
    _speechAvailable = await _speech.initialize();
  }

  Future<void> _initTts() async {
    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.5);
    await _tts.setPitch(1.05);
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    _avatarPulse.dispose();
    _speech.stop();
    _tts.stop();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _loading) return;

    _controller.clear();
    setState(() {
      _messages.add(_ChatMsg(text: text, isUser: true));
      _loading = true;
    });
    _scrollToBottom();

    try {
      final reply = await _agent.sendMessage(text);
      if (!mounted) return;
      setState(() {
        _messages.add(_ChatMsg(text: reply, isUser: false));
        _loading = false;
      });
      _speak(reply);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.add(_ChatMsg(text: "Couldn't reach the agent. Make sure AgentHub is running.", isUser: false));
        _loading = false;
      });
    }
    _scrollToBottom();
  }

  Future<void> _speak(String text) async {
    final clean = text.replaceAll(RegExp(r'[*_`#\[\]]'), '');
    if (clean.length > 300) {
      await _tts.speak(clean.substring(0, 300));
    } else {
      await _tts.speak(clean);
    }
  }

  Future<void> _toggleListening() async {
    if (_listening) {
      await _speech.stop();
      setState(() => _listening = false);
      return;
    }
    if (!_speechAvailable) {
      _speechAvailable = await _speech.initialize();
      if (!_speechAvailable) return;
    }
    setState(() => _listening = true);
    await _speech.listen(
      onResult: (result) {
        _controller.text = result.recognizedWords;
        if (result.finalResult) {
          setState(() => _listening = false);
          if (_controller.text.trim().isNotEmpty) _send();
        }
      },
      listenFor: const Duration(seconds: 15),
      pauseFor: const Duration(seconds: 3),
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(theme),
            Expanded(
              child: Stack(
                children: [
                  _buildMessageList(),
                  if (_listening) _buildListeningOverlay(),
                ],
              ),
            ),
            if (_loading) _buildTypingIndicator(),
            _buildInput(bottomInset),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFF1A1A22), width: 1)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white70, size: 20),
          ),
          const SizedBox(width: 12),
          AnimatedAssistantAvatar(size: 36, listening: _listening),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Paws Assistant', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16)),
                Text(
                  _listening ? 'Listening...' : (_loading ? 'Thinking...' : 'Online'),
                  style: TextStyle(
                    color: _listening ? const Color(0xFFFF4B6E) : (_loading ? const Color(0xFFF0A35E) : const Color(0xFF34D399)),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white54, size: 22),
            onPressed: () {
              _agent.resetSession();
              setState(() {
                _messages.clear();
                _messages.add(_ChatMsg(
                  text: "Fresh start! What can I help you with?",
                  isUser: false,
                ));
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMessageList() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: _messages.length,
      itemBuilder: (ctx, i) => _buildBubble(_messages[i]),
    );
  }

  Widget _buildBubble(_ChatMsg msg) {
    final isUser = msg.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF7C5CFC) : const Color(0xFF1C1C26),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isUser ? 18 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 18),
          ),
        ),
        child: SelectableText(
          msg.text,
          style: TextStyle(
            color: isUser ? Colors.white : const Color(0xFFEDEDF1),
            fontSize: 15,
            height: 1.45,
          ),
        ),
      ),
    );
  }

  Widget _buildListeningOverlay() {
    return Positioned.fill(
      child: GestureDetector(
        onTap: _toggleListening,
        child: Container(
          color: const Color(0xCC0A0A0F),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const AnimatedAssistantAvatar(size: 100, listening: true),
              const SizedBox(height: 20),
              Text(
                _controller.text.isEmpty ? 'Listening...' : _controller.text,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w500),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              const Text('Tap to stop', style: TextStyle(color: Colors.white54, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(left: 20, bottom: 8),
      child: Row(
        children: [
          AnimatedBuilder(
            animation: _avatarPulse,
            builder: (_, __) => Opacity(
              opacity: 0.4 + _avatarPulse.value * 0.6,
              child: const AssistantAvatar(size: 24),
            ),
          ),
          const SizedBox(width: 8),
          _dot(0),
          _dot(1),
          _dot(2),
        ],
      ),
    );
  }

  Widget _dot(int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 600 + index * 200),
      builder: (_, v, child) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2),
        child: Opacity(
          opacity: (v * 2 - 1).abs().clamp(0.3, 1.0),
          child: child,
        ),
      ),
      child: Container(
        width: 7,
        height: 7,
        decoration: BoxDecoration(color: const Color(0xFF7C5CFC), borderRadius: BorderRadius.circular(4)),
      ),
    );
  }

  Widget _buildInput(double bottomInset) {
    return Container(
      padding: EdgeInsets.fromLTRB(12, 8, 8, 8 + (bottomInset > 0 ? 0 : 8)),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFF1A1A22), width: 1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF121218),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF2A2A33)),
              ),
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                style: const TextStyle(color: Colors.white, fontSize: 15),
                decoration: const InputDecoration(
                  hintText: 'Ask me anything...',
                  hintStyle: TextStyle(color: Color(0xFF6B6B78)),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _send(),
                minLines: 1,
                maxLines: 4,
              ),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: _toggleListening,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _listening ? const Color(0xFFFF4B6E) : const Color(0xFF1C1C26),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                _listening ? Icons.mic_rounded : Icons.mic_none_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: _send,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: _loading
                    ? null
                    : const LinearGradient(colors: [Color(0xFF7C5CFC), Color(0xFFB06CFF)]),
                color: _loading ? const Color(0xFF2A2A33) : null,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                _loading ? Icons.hourglass_top_rounded : Icons.arrow_upward_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatMsg {
  final String text;
  final bool isUser;
  _ChatMsg({required this.text, required this.isUser});
}
