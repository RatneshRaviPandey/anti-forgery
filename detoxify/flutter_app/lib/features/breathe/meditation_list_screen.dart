import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';

class MeditationListScreen extends StatelessWidget {
  const MeditationListScreen({super.key});

  static const _categories = [
    ('all', 'All', '🎵'), ('sleep', 'Sleep', '😴'), ('focus', 'Focus', '🎯'),
    ('anxiety', 'Anxiety', '🌿'), ('stress', 'Stress', '🧘'), ('morning', 'Morning', '🌅'),
    ('digital_detox', 'Detox', '📵'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Text('← Back', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 8),
                Text('Meditation', style: Theme.of(context).textTheme.headlineLarge),
              ]),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final (_, label, emoji) = _categories[i];
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: i == 0 ? AppColors.primaryLight : AppColors.background,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(children: [
                      Text(emoji, style: const TextStyle(fontSize: 14)),
                      const SizedBox(width: 4),
                      Text(label, style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13,
                          color: i == 0 ? AppColors.primaryDark : AppColors.textSecondary)),
                    ]),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Text('🧘', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 12),
                  Text('Meditation sessions coming soon', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 4),
                  Text('Audio content will be available for streaming', style: Theme.of(context).textTheme.bodySmall),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
