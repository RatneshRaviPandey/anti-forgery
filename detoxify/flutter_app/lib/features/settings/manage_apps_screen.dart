import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/constants.dart';
import 'tracked_apps_provider.dart';

class ManageAppsScreen extends ConsumerWidget {
  const ManageAppsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tracked = ref.watch(trackedAppsProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Tracked Apps', style: Theme.of(context).textTheme.headlineSmall),
                        Text('${tracked.length} apps selected',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                  if (tracked.isNotEmpty)
                    TextButton(
                      onPressed: () => ref.read(trackedAppsProvider.notifier).clear(),
                      child: const Text('Clear All', style: TextStyle(color: AppColors.error, fontSize: 13)),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Info banner
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: AppColors.primary, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Select apps to monitor. Your screen time for these apps will be tracked and shown in your dashboard.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.primaryDark),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // App list
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: socialMediaApps.length,
                separatorBuilder: (_, __) => const SizedBox(height: 6),
                itemBuilder: (_, i) {
                  final app = socialMediaApps[i];
                  final pkg = app['package']!;
                  final name = app['name']!;
                  final isOn = tracked.contains(pkg);

                  return GestureDetector(
                    onTap: () => ref.read(trackedAppsProvider.notifier).toggle(pkg),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: isOn ? AppColors.primaryLight : AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isOn ? AppColors.primary : AppColors.border,
                          width: isOn ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          // App icon placeholder
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: isOn ? AppColors.primary.withOpacity(0.15) : AppColors.background,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(name[0],
                                  style: TextStyle(
                                    fontSize: 18, fontWeight: FontWeight.w700,
                                    color: isOn ? AppColors.primary : AppColors.textSecondary,
                                  )),
                            ),
                          ),
                          const SizedBox(width: 14),
                          // App name
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(name, style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: isOn ? AppColors.primary : AppColors.textPrimary,
                                )),
                                Text(pkg, style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.textHint, fontSize: 11,
                                )),
                              ],
                            ),
                          ),
                          // Toggle icon
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 200),
                            child: isOn
                                ? const Icon(Icons.check_circle, color: AppColors.primary, key: ValueKey('on'))
                                : const Icon(Icons.circle_outlined, color: AppColors.disabled, key: ValueKey('off')),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            // Bottom summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        tracked.isEmpty
                            ? 'No apps selected'
                            : '${tracked.length} app${tracked.length == 1 ? '' : 's'} being tracked',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: tracked.isEmpty ? AppColors.textHint : AppColors.textPrimary,
                        ),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => context.pop(),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(100, 44),
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                      ),
                      child: const Text('Done'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
