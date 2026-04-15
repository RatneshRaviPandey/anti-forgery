import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/utils.dart';

class DetoxHomeScreen extends StatelessWidget {
  const DetoxHomeScreen({super.key});

  static const _quickTimers = [
    (15, '15 min', '⚡'),
    (30, '30 min', '🎯'),
    (60, '1 hour', '💪'),
    (120, '2 hours', '🏆'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            const SizedBox(height: 16),
            Text('Detox', style: Theme.of(context).textTheme.headlineLarge),
            Text('Take a break from the noise', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 24),

            Text('Quick Start', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Row(
              children: _quickTimers.map((t) {
                final (min, label, emoji) = t;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: GestureDetector(
                      onTap: () => context.push('/detox/timer?minutes=$min'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(children: [
                          Text(emoji, style: const TextStyle(fontSize: 28)),
                          const SizedBox(height: 6),
                          Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                        ]),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            OutlinedButton(
              onPressed: () => context.push('/detox/timer?minutes=30'),
              child: const Text('Custom Timer'),
            ),
            const SizedBox(height: 32),

            Text('Challenges', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(children: [
                const Text('No challenges available yet', style: TextStyle(fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Text('Check back soon!', style: Theme.of(context).textTheme.bodySmall),
              ]),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
