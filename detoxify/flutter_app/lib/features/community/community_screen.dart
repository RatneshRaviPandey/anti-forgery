import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/theme.dart';
import '../auth/auth_provider.dart';
import '../home/dashboard_screen.dart';

class CommunityScreen extends ConsumerWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final streaksAsync = ref.watch(streaksProvider);
    final streaks = streaksAsync.valueOrNull ?? [];
    final detoxStreak = streaks.where((s) => s.type == 'daily_detox').firstOrNull;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            const SizedBox(height: 16),
            Text('Community', style: Theme.of(context).textTheme.headlineLarge),
            Text("You're not alone on this journey", style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 24),

            // Social proof
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: AppColors.secondaryLight, borderRadius: BorderRadius.circular(16)),
              child: Column(children: [
                const Text('🌍', style: TextStyle(fontSize: 32)),
                const SizedBox(height: 8),
                Text('Join thousands of people detoxing today',
                    style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.secondary), textAlign: TextAlign.center),
              ]),
            ),
            const SizedBox(height: 20),

            // Your stats
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Your Progress', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 16),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                    _Stat('🔥 ${detoxStreak?.currentCount ?? 0}', 'Day Streak'),
                    _Stat('🏆 ${detoxStreak?.longestCount ?? 0}', 'Best'),
                  ]),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Invite code
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
              child: Column(children: [
                Text('Invite Friends', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(8)),
                  child: Text(auth.user?.inviteCode ?? '---',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.primary, letterSpacing: 4)),
                ),
                const SizedBox(height: 8),
                Text('Share your code to connect with friends', style: Theme.of(context).textTheme.bodySmall),
              ]),
            ),
            const SizedBox(height: 20),

            // Leaderboard placeholder
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
              child: Column(children: [
                Text('Leaderboard coming soon', style: TextStyle(fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Text('Complete detox sessions to earn points!', style: Theme.of(context).textTheme.bodySmall),
              ]),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String value, label;
  const _Stat(this.value, this.label);
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(value, style: Theme.of(context).textTheme.titleLarge),
      Text(label, style: Theme.of(context).textTheme.bodySmall),
    ]);
  }
}
