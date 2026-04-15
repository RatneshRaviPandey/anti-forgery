import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/utils.dart';
import '../auth/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth.user;
    final level = calculateLevel(user?.xp ?? 0);
    final xpNext = xpToNextLevel(user?.xp ?? 0);

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            const SizedBox(height: 32),
            // Avatar
            Center(
              child: CircleAvatar(
                radius: 40,
                backgroundColor: AppColors.primaryLight,
                child: Text(user?.displayName.characters.first.toUpperCase() ?? '?',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: AppColors.primary)),
              ),
            ),
            const SizedBox(height: 12),
            Center(child: Text(user?.displayName ?? '', style: Theme.of(context).textTheme.headlineMedium)),
            Center(child: Text(user?.email ?? '', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary))),
            const SizedBox(height: 8),
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(20)),
                child: Text((user?.tier ?? 'free').toUpperCase(),
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary, letterSpacing: 1)),
              ),
            ),
            const SizedBox(height: 24),

            // XP card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
              child: Column(
                children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text('Level $level', style: Theme.of(context).textTheme.titleLarge),
                    Text('${user?.xp ?? 0} XP', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.primary)),
                  ]),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: xpNext > 0 ? 1 - (xpNext / (xpNext + ((user?.xp ?? 0) % 100))) : 0,
                      minHeight: 8, backgroundColor: AppColors.border, color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text('$xpNext XP to next level', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Links
            _LinkTile(icon: Icons.apps, label: 'Manage Tracked Apps', onTap: () => context.push('/settings/apps')),
            _LinkTile(icon: Icons.timer_outlined, label: 'Screen Time Goals', onTap: () => context.push('/settings/goals')),
            _LinkTile(icon: Icons.bar_chart, label: 'Analytics & Reports', onTap: () => context.push('/analytics')),
            if (user?.tier == 'free')
              _LinkTile(icon: Icons.star, label: 'Upgrade to Pro', onTap: () => context.push('/paywall')),
            const SizedBox(height: 24),

            // Logout
            Center(
              child: TextButton(
                onPressed: () => ref.read(authProvider.notifier).logout(),
                child: const Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600)),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _LinkTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _LinkTile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
          child: Row(children: [
            Icon(icon, color: AppColors.textSecondary),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500))),
            const Icon(Icons.chevron_right, color: AppColors.textHint),
          ]),
        ),
      ),
    );
  }
}
