import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/constants.dart';

class BreatheHomeScreen extends StatelessWidget {
  const BreatheHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            const SizedBox(height: 16),
            Text('Breathe', style: Theme.of(context).textTheme.headlineLarge),
            Text('Find your calm', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 24),

            Text('Breathing Exercises', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            ...breathingExercises.map((ex) {
              final isLocked = ex.tierRequired != tierFree;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: GestureDetector(
                  onTap: () {
                    if (isLocked) {
                      context.push('/paywall');
                    } else {
                      context.push('/breathe/session?id=${ex.id}');
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(
                            color: Color(ex.colorValue).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Center(child: Text(
                            ex.id == 'box_breathing' ? '⬜' : ex.id == 'four_seven_eight' ? '🌙' :
                            ex.id == 'calm_breathing' ? '🌊' : ex.id == 'energizing' ? '⚡' : '🍃',
                            style: const TextStyle(fontSize: 22),
                          )),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(ex.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(ex.description, style: Theme.of(context).textTheme.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 4),
                            Text(ex.steps.map((s) => '${s.durationSeconds}s').join(' - '),
                                style: TextStyle(fontSize: 11, color: AppColors.textHint)),
                          ]),
                        ),
                        if (isLocked) Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.accentLight, borderRadius: BorderRadius.circular(6)),
                          child: const Text('PRO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.accent)),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),
            Text('Meditation', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () => context.push('/breathe/meditations'),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: AppColors.accentLight, borderRadius: BorderRadius.circular(16)),
                child: Row(children: [
                  const Text('🧘‍♀️', style: TextStyle(fontSize: 36)),
                  const SizedBox(width: 16),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Guided Meditation', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.accent)),
                    Text('Sleep, focus, anxiety relief & more', style: Theme.of(context).textTheme.bodySmall),
                  ])),
                  const Icon(Icons.chevron_right, color: AppColors.accent),
                ]),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
