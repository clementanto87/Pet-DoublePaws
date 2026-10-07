import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/floating_assistant_service.dart';
import '../widgets/assistant_avatar.dart';

class MainScaffold extends StatelessWidget {
  final Widget child;

  const MainScaffold({
    required this.child,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      floatingActionButton: _AssistantFab(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateSelectedIndex(context),
        selectedItemColor: const Color(0xFFF97316),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        backgroundColor: Colors.white,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        onTap: (index) => _onItemTapped(index, context),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Home24',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_rounded),
            label: 'Messages',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_rounded),
            label: 'Bookings',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  static int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/messages')) return 1;
    if (location.startsWith('/bookings')) return 2;
    if (location.startsWith('/profile')) return 3;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/messages');
        break;
      case 2:
        context.go('/bookings');
        break;
      case 3:
        context.go('/profile');
        break;
    }
  }
}

class _AssistantFab extends StatefulWidget {
  @override
  State<_AssistantFab> createState() => _AssistantFabState();
}

class _AssistantFabState extends State<_AssistantFab> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  bool _showTooltip = true;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 2000))..repeat();
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) setState(() => _showTooltip = false);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _onTap() {
    context.push('/assistant');
    if (!Platform.isAndroid) return;
    FloatingAssistantService.showBubble();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (_showTooltip)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF1C1C26),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text('Ask me anything!', style: TextStyle(color: Colors.white, fontSize: 12)),
            ),
          GestureDetector(
            onTap: _onTap,
            child: const AnimatedAssistantAvatar(size: 56),
          ),
        ],
      ),
    );
  }
}
