import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import 'package:intl/intl.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> _conversations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchConversations();
  }

  Future<void> _fetchConversations() async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final data = await apiService.getConversations();
    if (mounted) {
      setState(() {
        _conversations = data;
        _isLoading = false;
      });
    }
  }

  String _formatTime(String? timestamp) {
    if (timestamp == null) return '';
    final date = DateTime.parse(timestamp).toLocal();
    final now = DateTime.now();
    
    if (date.year == now.year && date.month == now.month && date.day == now.day) {
      return DateFormat.jm().format(date); // 10:30 AM
    } else {
      return DateFormat.MMMd().format(date); // Oct 24
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
        title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFFF97316)))
        : _conversations.isEmpty
            ? const Center(child: Text('No messages yet', style: TextStyle(color: Colors.grey)))
            : ListView.separated(
                itemCount: _conversations.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final conv = _conversations[index];
                  final user = conv['user'];
                  final lastMsg = conv['lastMessage'];
                  final unread = conv['unreadCount'] ?? 0;
                  
                  final name = '${user['firstName']} ${user['lastName']}';
                  // Simple check for role, though backend response might not include 'role' in user object explicitly 
                  // or it might be needed for UI. Let's assume generic for now.
                  
                  // Map to the format ChatScreen expects
                  final chatUserMap = {
                    'id': user['id'],
                    'name': name,
                    'avatar': user['photoUrl'],
                  };

                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Stack(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: const Color(0xFFF97316).withOpacity(0.1),
                          child: Text(
                            name.isNotEmpty ? name[0] : '?',
                            style: const TextStyle(
                              color: Color(0xFFF97316),
                              fontWeight: FontWeight.bold,
                              fontSize: 20,
                            ),
                          ),
                        ),
                        if (unread > 0)
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              width: 12,
                              height: 12,
                              decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                                border: Border.fromBorderSide(
                                  BorderSide(color: Colors.white, width: 2),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                    title: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          _formatTime(lastMsg['createdAt']),
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                        ),
                      ],
                    ),
                    subtitle: Row(
                      children: [
                        Expanded(
                          child: Text(
                            lastMsg['content'] != null && (lastMsg['content'] as String).isNotEmpty 
                                ? lastMsg['content'] 
                                : (lastMsg['imageUrl'] != null ? '📷 Photo' : ''),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: unread > 0 ? Colors.black87 : Colors.grey.shade600,
                              fontWeight: unread > 0 ? FontWeight.w600 : FontWeight.normal,
                            ),
                          ),
                        ),
                      ],
                    ),
                    onTap: () {
                      context.push('/chat', extra: {
                        'otherUser': chatUserMap, 
                      });
                    },
                  );
                },
              ),
    );
  }
}
