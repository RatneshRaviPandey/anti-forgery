import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/constants.dart';
import '../settings/tracked_apps_provider.dart';

class SelectAppsScreen extends ConsumerStatefulWidget {
  const SelectAppsScreen({super.key});
  @override
  ConsumerState<SelectAppsScreen> createState() => _SelectAppsScreenState();
}

class _SelectAppsScreenState extends ConsumerState<SelectAppsScreen> {
  final Set<String> _selected = {};

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
              Text('Which apps do you\nwant to track?', style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 8),
              Text('Select the apps you\'d like to monitor',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 24),
              Expanded(
                child: ListView.separated(
                  itemCount: socialMediaApps.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) {
                    final app = socialMediaApps[i];
                    final pkg = app['package']!;
                    final isOn = _selected.contains(pkg);
                    return GestureDetector(
                      onTap: () => setState(() => isOn ? _selected.remove(pkg) : _selected.add(pkg)),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isOn ? AppColors.primaryLight : AppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isOn ? AppColors.primary : AppColors.border, width: 1.5),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 18,
                              backgroundColor: AppColors.background,
                              child: Text(app['name']![0], style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Text(app['name']!, style: const TextStyle(fontWeight: FontWeight.w500))),
                            Icon(isOn ? Icons.check_circle : Icons.circle_outlined,
                                color: isOn ? AppColors.primary : AppColors.disabled),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  // Persist selected apps
                  ref.read(trackedAppsProvider.notifier).setAll(_selected);
                  context.go('/onboarding/set-goal');
                },
                child: Text('Continue (${_selected.length} selected)'),
              ),
              Center(
                child: TextButton(
                  onPressed: () => context.go('/onboarding/set-goal'),
                  child: const Text('Skip for now'),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
