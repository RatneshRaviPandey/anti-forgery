import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_provider.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/onboarding/welcome_screen.dart';
import '../features/onboarding/select_apps_screen.dart';
import '../features/onboarding/set_goal_screen.dart';
import '../features/home/dashboard_screen.dart';
import '../features/detox/detox_home_screen.dart';
import '../features/detox/detox_timer_screen.dart';
import '../features/breathe/breathe_home_screen.dart';
import '../features/breathe/breathing_session_screen.dart';
import '../features/breathe/meditation_list_screen.dart';
import '../features/breathe/meditation_player_screen.dart';
import '../features/community/community_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/analytics/analytics_screen.dart';
import '../features/paywall/paywall_screen.dart';
import '../features/settings/manage_apps_screen.dart';
import '../features/settings/goals_screen.dart';
import '../widgets/shell_scaffold.dart';

/// Notifies GoRouter when auth state changes WITHOUT rebuilding the router.
class _AuthNotifier extends ChangeNotifier {
  _AuthNotifier(Ref ref) {
    ref.listen(authProvider, (_, __) => notifyListeners());
  }
}

final _authNotifierProvider = Provider<_AuthNotifier>((ref) => _AuthNotifier(ref));

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.read(_authNotifierProvider);

  return GoRouter(
    initialLocation: '/auth/login',
    refreshListenable: notifier,
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final loc = state.matchedLocation;
      final isAuth = loc.startsWith('/auth');
      final isOnboard = loc.startsWith('/onboarding');

      // Still loading — don't redirect
      if (auth.isLoading) return null;

      // Not logged in → login page
      if (!auth.isAuthenticated && !isAuth) return '/auth/login';

      // Logged in → leave auth pages
      if (auth.isAuthenticated && isAuth) {
        return (auth.user?.onboarded ?? false) ? '/home' : '/onboarding/welcome';
      }

      // Logged in, not onboarded → force onboarding
      if (auth.isAuthenticated && !(auth.user?.onboarded ?? false) && !isOnboard && !isAuth) {
        return '/onboarding/welcome';
      }

      return null;
    },
    routes: [
      // Auth
      GoRoute(path: '/auth/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/auth/register', builder: (_, __) => const RegisterScreen()),

      // Onboarding
      GoRoute(path: '/onboarding/welcome', builder: (_, __) => const WelcomeScreen()),
      GoRoute(path: '/onboarding/select-apps', builder: (_, __) => const SelectAppsScreen()),
      GoRoute(path: '/onboarding/set-goal', builder: (_, __) => const SetGoalScreen()),

      // Main app with bottom nav
      ShellRoute(
        builder: (_, state, child) => ShellScaffold(state: state, child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const DashboardScreen()),
          GoRoute(path: '/detox', builder: (_, __) => const DetoxHomeScreen()),
          GoRoute(path: '/breathe', builder: (_, __) => const BreatheHomeScreen()),
          GoRoute(path: '/community', builder: (_, __) => const CommunityScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),

      // Full-screen routes
      GoRoute(path: '/detox/timer', builder: (_, state) {
        final minutes = int.tryParse(state.uri.queryParameters['minutes'] ?? '30') ?? 30;
        return DetoxTimerScreen(targetMinutes: minutes);
      }),
      GoRoute(path: '/breathe/session', builder: (_, state) {
        final id = state.uri.queryParameters['id'] ?? 'box_breathing';
        return BreathingSessionScreen(exerciseId: id);
      }),
      GoRoute(path: '/breathe/meditations', builder: (_, __) => const MeditationListScreen()),
      GoRoute(path: '/breathe/player', builder: (_, state) {
        final id = state.uri.queryParameters['id'] ?? '';
        return MeditationPlayerScreen(sessionId: id);
      }),
      GoRoute(path: '/settings/apps', builder: (_, __) => const ManageAppsScreen()),
      GoRoute(path: '/settings/goals', builder: (_, __) => const GoalsScreen()),
      GoRoute(path: '/analytics', builder: (_, __) => const AnalyticsScreen()),
      GoRoute(path: '/paywall', pageBuilder: (_, __) => const MaterialPage(
        fullscreenDialog: true,
        child: PaywallScreen(),
      )),
    ],
  );
});
