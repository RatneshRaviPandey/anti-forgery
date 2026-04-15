import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../auth/auth_provider.dart';

class SetGoalScreen extends ConsumerStatefulWidget {
  const SetGoalScreen({super.key});
  @override
  ConsumerState<SetGoalScreen> createState() => _SetGoalScreenState();
}

class _SetGoalScreenState extends ConsumerState<SetGoalScreen> {
  int _selectedMinutes = 120;

  final _options = const [
    (60, '1 hour', 'Ambitious goal', '🏆'),
    (120, '2 hours', 'Recommended', '🎯'),
    (180, '3 hours', 'Moderate', '👌'),
    (240, '4 hours', 'Easy start', '🌱'),
  ];

  void _complete() {
    ref.read(authProvider.notifier).markOnboarded();
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              Text('Set your daily\nscreen time goal', style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 8),
              Text("Don't worry — you can change this anytime",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 32),
              Expanded(
                child: ListView.separated(
                  itemCount: _options.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) {
                    final (min, label, desc, emoji) = _options[i];
                    final isOn = _selectedMinutes == min;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedMinutes = min),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: isOn ? AppColors.primaryLight : AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isOn ? AppColors.primary : AppColors.border, width: 1.5),
                        ),
                        child: Row(
                          children: [
                            Text(emoji, style: const TextStyle(fontSize: 28)),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(label, style: Theme.of(context).textTheme.titleLarge),
                                  Text(desc, style: Theme.of(context).textTheme.bodySmall),
                                ],
                              ),
                            ),
                            Icon(isOn ? Icons.radio_button_checked : Icons.radio_button_off,
                                color: isOn ? AppColors.primary : AppColors.disabled),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: _complete, child: const Text('Start My Journey')),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
