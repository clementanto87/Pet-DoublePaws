import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'services/api_service.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/home_screen.dart';
import 'screens/search_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/bookings_screen.dart';
import 'screens/sitter_profile_screen.dart';
import 'screens/booking_process_screen.dart';
import 'screens/messages_screen.dart';
import 'screens/chat_screen.dart';
import 'screens/my_pets_screen.dart';
import 'screens/sitter_dashboard_screen.dart';
import 'widgets/main_scaffold.dart';

import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService().init();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider(create: (_) => ApiService()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: MaterialApp.router(
        title: 'Double Paws',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFF97316), // Orange primary color
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            centerTitle: true,
            elevation: 0,
          ),
        ),
        routerConfig: _router,
      ),
    );
  }
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter _router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/signup',
      builder: (context, state) => const SignupScreen(),
    ),
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return MainScaffold(child: child);
      },
      routes: [
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/bookings',
          builder: (context, state) => const BookingsScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/messages',
          builder: (context, state) => const MessagesScreen(),
        ),
      ],
    ),
    GoRoute(
      path: '/search',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return SearchScreen(searchParams: extra);
      },
    ),
    GoRoute(
      path: '/sitter-profile',
      builder: (context, state) {
        final sitter = state.extra as Map<String, dynamic>;
        return SitterProfileScreen(sitter: sitter);
      },
    ),
    GoRoute(
      path: '/book-sitter',
      builder: (context, state) {
        final sitter = state.extra as Map<String, dynamic>;
        return BookingProcessScreen(sitter: sitter);
      },
    ),
    GoRoute(
      path: '/chat',
      builder: (context, state) {
        final extras = state.extra as Map<String, dynamic>;
        return ChatScreen(otherUser: extras['otherUser']);
      },
    ),
    GoRoute(
      path: '/edit-booking',
      builder: (context, state) {
        final extras = state.extra as Map<String, dynamic>;
        return BookingProcessScreen(
          sitter: extras['sitter'],
          booking: extras['booking'],
        );
      },
    ),
    GoRoute(
      path: '/my-pets',
      builder: (context, state) => const MyPetsScreen(),
    ),
    GoRoute(
      path: '/sitter-dashboard',
      builder: (context, state) => const SitterDashboardScreen(),
    ),
  ],
);
