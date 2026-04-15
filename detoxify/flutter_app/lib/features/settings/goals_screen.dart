import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/utils.dart';
import 'goals_provider.dart';
import 'tracked_apps_provider.dart';

class GoalsScreen extends ConsumerStatefulWidget {
  const GoalsScreen({super.key});
  @override
  ConsumerState<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends ConsumerState<GoalsScreen> {
  late int _dailyGoal;
  bool _initialized = false;

  @override
  Widget build(BuildContext context) {
    final goals = ref.watch(goalsProvider);
    final tracked = ref.watch(trackedAppsProvider);
    final trackedInfos = ref.read(trackedAppsProvider.notifier).trackedAppInfos;

    if (!_initialized) {
      _dailyGoal = goals.dailyGoalMinutes;
      _initialized = true;
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Row(children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                ),
                const SizedBox(width: 12),
                Expanded(child: Text('Screen Time Goals', style: Theme.of(context).textTheme.headlineSmall)),
              ]),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  // Daily total goal
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Daily Total Goal', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                          Text(formatMinutes(_dailyGoal), style: const TextStyle(
                            fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.primary,
                          )),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SliderTheme(
                        data: SliderThemeData(
                          activeTrackColor: AppColors.primary,
                          inactiveTrackColor: AppColors.primary.withOpacity(0.2),
                          thumbColor: AppColors.primary,
                          overlayColor: AppColors.primary.withOpacity(0.1),
                        ),
                        child: Slider(
                          value: _dailyGoal.toDouble(),
                          min: 15, max: 480, divisions: 31,
                          label: formatMinutes(_dailyGoal),
                          onChanged: (v) => setState(() => _dailyGoal = v.round()),
                          onChangeEnd: (v) => ref.read(goalsProvider.notifier).setDailyGoal(v.round()),
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('15m', style: TextStyle(fontSize: 11, color: AppColors.textHint)),
                          Text('8h', style: TextStyle(fontSize: 11, color: AppColors.textHint)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(children: [
                        for (final m in [60, 120, 180, 240])
                          Expanded(child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 3),
                            child: GestureDetector(
                              onTap: () {
                                setState(() => _dailyGoal = m);
                                ref.read(goalsProvider.notifier).setDailyGoal(m);
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                decoration: BoxDecoration(
                                  color: _dailyGoal == m ? AppColors.primary : Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: _dailyGoal == m ? AppColors.primary : AppColors.border),
                                ),
                                child: Center(child: Text(formatMinutes(m), style: TextStyle(
                                  fontSize: 12, fontWeight: FontWeight.w600,
                                  color: _dailyGoal == m ? Colors.white : AppColors.textSecondary,
                                ))),
                              ),
                            ),
                          )),
                      ]),
                    ]),
                  ),
                  const SizedBox(height: 24),

                  // ── Blocking Mode Section ──
                  Text('App Blocking', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 4),
                  Text('Choose what happens when an app exceeds its time limit.',
                      style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 12),

                  // Accessibility permission banner
                  if (goals.blockingMode != blockingModeNone && !goals.isAccessibilityEnabled)
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.warmLight,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.warm.withOpacity(0.3)),
                      ),
                      child: Row(children: [
                        const Text('⚠️', style: TextStyle(fontSize: 20)),
                        const SizedBox(width: 10),
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Accessibility Service Required', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            Text('Enable Screen Detox in Accessibility settings to block apps.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        )),
                        GestureDetector(
                          onTap: () => ref.read(goalsProvider.notifier).openAccessibilitySettings(),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(color: AppColors.warm, borderRadius: BorderRadius.circular(8)),
                            child: const Text('Enable', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                          ),
                        ),
                      ]),
                    ),

                  // Mode selector cards
                  _BlockModeCard(
                    title: 'Off',
                    subtitle: 'Track only — no interruptions',
                    emoji: '📊',
                    isSelected: goals.blockingMode == blockingModeNone,
                    onTap: () => ref.read(goalsProvider.notifier).setBlockingMode(blockingModeNone),
                  ),
                  const SizedBox(height: 8),
                  _BlockModeCard(
                    title: 'Soft Block',
                    subtitle: 'Show warning — user can continue',
                    emoji: '⚠️',
                    isSelected: goals.blockingMode == blockingModeSoft,
                    color: AppColors.warm,
                    onTap: () => ref.read(goalsProvider.notifier).setBlockingMode(blockingModeSoft),
                  ),
                  const SizedBox(height: 8),
                  _BlockModeCard(
                    title: 'Hard Block',
                    subtitle: 'Close app and prevent reopening',
                    emoji: '⛔',
                    isSelected: goals.blockingMode == blockingModeHard,
                    color: AppColors.error,
                    onTap: () => ref.read(goalsProvider.notifier).setBlockingMode(blockingModeHard),
                  ),
                  const SizedBox(height: 24),

                  // Per-app goals
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Per-App Limits', style: Theme.of(context).textTheme.titleLarge),
                      Text('Optional', style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Set individual time limits for each tracked app. If not set, only the total daily goal applies.',
                      style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 12),

                  if (tracked.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                      child: Center(child: Text('No apps tracked yet. Add apps first.', style: TextStyle(color: AppColors.textHint))),
                    )
                  else
                    ...trackedInfos.map((app) {
                      final pkg = app['package']!;
                      final name = app['name']!;
                      final appGoal = goals.getAppGoal(pkg);
                      final hasGoal = appGoal != null;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: hasGoal ? AppColors.surface : AppColors.background,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: hasGoal ? AppColors.primary.withOpacity(0.3) : AppColors.border),
                        ),
                        child: Row(children: [
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(
                              color: hasGoal ? AppColors.primaryLight : AppColors.border.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(child: Text(name[0], style: TextStyle(
                              fontWeight: FontWeight.w700, color: hasGoal ? AppColors.primary : AppColors.textHint,
                            ))),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              Text(hasGoal ? 'Limit: ${formatMinutes(appGoal)}' : 'No limit set',
                                  style: TextStyle(fontSize: 12, color: hasGoal ? AppColors.primary : AppColors.textHint)),
                            ],
                          )),
                          if (hasGoal)
                            GestureDetector(
                              onTap: () => ref.read(goalsProvider.notifier).removeAppGoal(pkg),
                              child: const Icon(Icons.close, size: 18, color: AppColors.textHint),
                            ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => _showAppGoalPicker(pkg, name, appGoal ?? 60),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: hasGoal ? AppColors.primary : AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(hasGoal ? 'Edit' : 'Set', style: TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w600,
                                color: hasGoal ? Colors.white : AppColors.primary,
                              )),
                            ),
                          ),
                        ]),
                      );
                    }),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAppGoalPicker(String pkg, String name, int current) {
    int selected = current;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            Text('Set limit for $name', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 20),
            Text(formatMinutes(selected), style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: AppColors.primary)),
            const SizedBox(height: 12),
            Slider(
              value: selected.toDouble(), min: 5, max: 240, divisions: 47,
              activeColor: AppColors.primary, label: formatMinutes(selected),
              onChanged: (v) => setSheet(() => selected = v.round()),
            ),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('5m', style: TextStyle(fontSize: 11, color: AppColors.textHint)),
              Text('4h', style: TextStyle(fontSize: 11, color: AppColors.textHint)),
            ]),
            const SizedBox(height: 8),
            Row(children: [
              for (final m in [15, 30, 60, 90, 120])
                Expanded(child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: GestureDetector(
                    onTap: () => setSheet(() => selected = m),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: selected == m ? AppColors.primary : AppColors.background,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(child: Text(formatMinutes(m), style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w600,
                        color: selected == m ? Colors.white : AppColors.textSecondary,
                      ))),
                    ),
                  ),
                )),
            ]),
            const SizedBox(height: 20),
            Row(children: [
              Expanded(child: OutlinedButton(
                onPressed: () { ref.read(goalsProvider.notifier).removeAppGoal(pkg); Navigator.pop(ctx); },
                child: const Text('Remove'),
              )),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton(
                onPressed: () { ref.read(goalsProvider.notifier).setAppGoal(pkg, selected); Navigator.pop(ctx); },
                child: const Text('Save'),
              )),
            ]),
            const SizedBox(height: 8),
          ]),
        ),
      ),
    );
  }
}

class _BlockModeCard extends StatelessWidget {
  final String title, subtitle, emoji;
  final bool isSelected;
  final Color color;
  final VoidCallback onTap;

  const _BlockModeCard({
    required this.title,
    required this.subtitle,
    required this.emoji,
    required this.isSelected,
    required this.onTap,
    this.color = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.08) : AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? color : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 14),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(
                fontWeight: FontWeight.w600, fontSize: 15,
                color: isSelected ? color : AppColors.textPrimary,
              )),
              const SizedBox(height: 2),
              Text(subtitle, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
          )),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: isSelected
                ? Icon(Icons.check_circle, color: color, key: const ValueKey('on'))
                : const Icon(Icons.circle_outlined, color: AppColors.disabled, key: ValueKey('off')),
          ),
        ]),
      ),
    );
  }
}
