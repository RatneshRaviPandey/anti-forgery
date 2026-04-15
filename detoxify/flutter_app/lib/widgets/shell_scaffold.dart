import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ShellScaffold extends StatelessWidget {
  final GoRouterState state;
  final Widget child;

  const ShellScaffold({super.key, required this.state, required this.child});

  int _indexFromLocation(String loc) {
    if (loc.startsWith('/detox')) return 1;
    if (loc.startsWith('/breathe')) return 2;
    if (loc.startsWith('/community')) return 3;
    if (loc.startsWith('/profile')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _indexFromLocation(state.matchedLocation),
        onTap: (i) {
          const routes = ['/home', '/detox', '/breathe', '/community', '/profile'];
          context.go(routes[i]);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.timer_rounded), label: 'Detox'),
          BottomNavigationBarItem(icon: Icon(Icons.air_rounded), label: 'Breathe'),
          BottomNavigationBarItem(icon: Icon(Icons.people_rounded), label: 'Community'),
          BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
      ),
    );
  }
}
