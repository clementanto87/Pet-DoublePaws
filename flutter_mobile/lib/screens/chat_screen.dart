import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import '../services/notification_service.dart';

class ChatScreen extends StatefulWidget {
  final Map<String, dynamic> otherUser;

  const ChatScreen({super.key, required this.otherUser});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _picker = ImagePicker();
  
  List<dynamic> _messages = [];
  bool _isLoading = true;

  late String _currentUserId;
  StreamSubscription? _messageSubscription;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _currentUserId = authProvider.user?['id'] ?? '';
    
    // Set current chat partner for notification filtering
    NotificationService().currentChatPartnerId = widget.otherUser['id'];
    
    // Subscribe to real-time messages
    _messageSubscription = NotificationService().messageStream.listen((data) {
      if (data['senderId'] == widget.otherUser['id']) {
        if (mounted) {
          setState(() {
            _messages.add({
              'senderId': data['senderId'],
              'content': data['message'],
              // Use current time or pass timestamp from backend if available in data
              'createdAt': DateTime.now().toIso8601String(), 
              'imageUrl': null, // Handle image from socket data if sent
            });
          });
          _scrollToBottom();
        }
      }
    });

    _fetchMessages();
  }

  @override
  void dispose() {
    // Clear chat partner to resume notifications
    NotificationService().currentChatPartnerId = null;
    _messageSubscription?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMessages() async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final msgs = await apiService.getConversation(widget.otherUser['id']);
    
    if (mounted) {
      setState(() {
        _messages = msgs;
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  String _formatTime(String? timestamp) {
    if (timestamp == null) return '';
    final date = DateTime.parse(timestamp).toLocal();
    return DateFormat.jm().format(date);
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(source: source);
      if (image != null) {
        // Optimistic UI for image
        final tempMsg = {
          'senderId': _currentUserId,
          'content': '',
          'imageUrl': image.path, // Local path for display
          'createdAt': DateTime.now().toIso8601String(),
          'isLocal': true, // Custom flag to know if it's local path or base64
        };
        
        setState(() => _messages.add(tempMsg));
        _scrollToBottom();
        
        // Convert to Base64
        final bytes = await File(image.path).readAsBytes();
        final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}'; // Assuming jpeg/png

        // Send to backend
        final apiService = Provider.of<ApiService>(context, listen: false);
        await apiService.sendMessage(
          receiverId: widget.otherUser['id'],
          imageUrl: base64Image,
        );
        
        // Refresh to get server confirmed message
        // _fetchMessages(); // Optional, or just leave local one
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _messageController.clear();

    // Optimistic UI
    setState(() {
      _messages.add({
        'senderId': _currentUserId,
        'content': text,
        'createdAt': DateTime.now().toIso8601String(),
      });
    });
    _scrollToBottom();

    final apiService = Provider.of<ApiService>(context, listen: false);
    await apiService.sendMessage(
      receiverId: widget.otherUser['id'],
      content: text,
    );
    
    // In real app, we'd handle failure/retry
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Photo Library'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take Photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: const Color(0xFFF97316).withOpacity(0.1),
              // widget.otherUser['avatar'] is backend photoUrl or null
              backgroundImage: widget.otherUser['avatar'] != null 
                  ? NetworkImage(widget.otherUser['avatar']) 
                  : null, 
              child: widget.otherUser['avatar'] == null 
                  ? Text(
                      (widget.otherUser['name'] as String? ?? 'User')[0],
                      style: const TextStyle(
                        color: Color(0xFFF97316),
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 10),
            Text(
              widget.otherUser['name'] as String? ?? 'Chat',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFF97316)))
                : _messages.isEmpty 
                    ? const Center(child: Text("Say hello! 👋"))
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final msg = _messages[index];
                          final isMe = msg['senderId'] == _currentUserId;
                          final content = msg['content'] as String?;
                          final imageUrl = msg['imageUrl'] as String?;
                          final isLocal = msg['isLocal'] == true;

                          return Align(
                            alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              constraints: BoxConstraints(
                                maxWidth: MediaQuery.of(context).size.width * 0.75,
                              ),
                              decoration: BoxDecoration(
                                color: isMe ? const Color(0xFFF97316) : Colors.grey.shade100,
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(16),
                                  topRight: const Radius.circular(16),
                                  bottomLeft: isMe ? const Radius.circular(16) : Radius.zero,
                                  bottomRight: isMe ? Radius.zero : const Radius.circular(16),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (imageUrl != null && imageUrl.isNotEmpty)
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: isLocal
                                        ? Image.file(
                                            File(imageUrl),
                                            height: 200, width: 200, fit: BoxFit.cover,
                                          )
                                        : (imageUrl.startsWith('data:image') 
                                            // Handle Base64 string from backend
                                            ? Image.memory(
                                                base64Decode(imageUrl.split(',').last),
                                                height: 200, width: 200, fit: BoxFit.cover
                                              )
                                            // Or generic URL
                                            : Image.network(
                                                imageUrl,
                                                height: 200, width: 200, fit: BoxFit.cover,
                                                errorBuilder: (c,o,s) => const Icon(Icons.broken_image),
                                              )
                                          ),
                                    ),
                                  if (content != null && content.isNotEmpty)
                                    Text(
                                      content,
                                      style: TextStyle(
                                        color: isMe ? Colors.white : Colors.black87,
                                        fontSize: 15,
                                      ),
                                    ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatTime(msg['createdAt']),
                                    style: TextStyle(
                                      color: isMe ? Colors.white.withOpacity(0.7) : Colors.grey.shade500,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8), 
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.add_a_photo_outlined, color: Colors.grey),
                  onPressed: _showAttachmentOptions,
                ),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      filled: true,
                      fillColor: Colors.grey.shade50,
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 20,
                  backgroundColor: const Color(0xFFF97316),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white, size: 18),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
