import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/utils.dart';
import '../../models/detox.dart';
import '../auth/auth_provider.dart';
import '../settings/tracked_apps_provider.dart';
import '../../widgets/progress_ring.dart';
import 'usage_tracking_provider.dart';
import 'permission_banner.dart';
import '../settings/goals_provider.dart';

final streaksProvider = FutureProvider<List<Streak>>((ref) async {
  final api = ref.read(apiProvider);
  try {
    final data = await api.getStreaks();
    return (data['streaks'] as List?)?.map((e) => Streak.fromJson(e)).toList() ?? [];
  } catch (_) {
    return [];
  }
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final usageState = ref.watch(usageTrackingProvider);
    final streaksAsync = ref.watch(streaksProvider);

    final user = auth.user;
    final streaks = streaksAsync.valueOrNull ?? [];
    final detoxStreak = streaks.where((s) => s.type == 'daily_detox').firstOrNull;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await ref.read(usageTrackingProvider.notifier).recheckPermission();
            await ref.read(usageTrackingProvider.notifier).fetchUsage();
            ref.invalidate(streaksProvider);
          },
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              const SizedBox(height: 16),
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(getGreeting(), style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
                    Text(user?.displayName ?? 'Friend', style: Theme.of(context).textTheme.headlineMedium),
                  ]),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: AppColors.warmLight, borderRadius: BorderRadius.circular(20)),
                    child: Row(children: [
                      const Text('🔥', style: TextStyle(fontSize: 18)),
                      const SizedBox(width: 4),
                      Text('${detoxStreak?.currentCount ?? 0}',
                          style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.warm)),
                    ]),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Permission banner — shows when usage access not granted
              if (!usageState.hasPermission && !usageState.isLoading)
                PermissionBanner(
                  onGranted: () => ref.read(usageTrackingProvider.notifier).recheckPermission(),
                ),

              // Motivational quote
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(16)),
                child: Text(getMotivationalQuote(),
                    style: TextStyle(color: AppColors.primaryDark, fontStyle: FontStyle.italic), textAlign: TextAlign.center),
              ),
              const SizedBox(height: 20),

              // Real usage data from native UsageStatsManager
              if (usageState.isLoading)
                const SizedBox(height: 200, child: Center(child: CircularProgressIndicator()))
              else
                _RealUsageCard(usageState: usageState),

              const SizedBox(height: 20),

              // Tracked Apps Card
              _TrackedAppsCard(),
              const SizedBox(height: 16),

              // Quick actions
              Text('Quick Actions', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              Row(
                children: [
                  _ActionCard(emoji: '⏱️', title: 'Detox', subtitle: 'Focus timer', color: AppColors.primaryLight,
                      onTap: () => context.go('/detox')),
                  const SizedBox(width: 12),
                  _ActionCard(emoji: '🌬️', title: 'Breathe', subtitle: 'Calm mind', color: AppColors.secondaryLight,
                      onTap: () => context.go('/breathe')),
                  const SizedBox(width: 12),
                  _ActionCard(emoji: '🧘', title: 'Meditate', subtitle: 'Find peace', color: AppColors.accentLight,
                      onTap: () => context.go('/breathe/meditations')),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _RealUsageCard extends ConsumerWidget {
  final UsageTrackingState usageState;
  const _RealUsageCard({required this.usageState});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goalMinutes = ref.watch(goalsProvider).dailyGoalMinutes;
    final total = usageState.totalMinutes;
    final progress = goalMinutes > 0 ? (total / goalMinutes).clamp(0.0, 1.0) : 0.0;
    final isUnder = total <= goalMinutes;
    final saved = isUnder ? goalMinutes - total : total - goalMinutes;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Today's Screen Time", style: Theme.of(context).textTheme.titleLarge),
              if (usageState.isTracking)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.secondaryLight, borderRadius: BorderRadius.circular(8)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.secondary, shape: BoxShape.circle)),
                    const SizedBox(width: 4),
                    Text('Live', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.secondary)),
                  ]),
                ),
            ],
          ),
          const SizedBox(height: 20),
          ProgressRing(
            progress: progress,
            size: 160,
            strokeWidth: 14,
            color: isUnder ? AppColors.secondary : AppColors.warm,
            label: formatMinutes(total),
            sublabel: 'of ${formatMinutes(goalMinutes)} goal',
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _Stat(value: formatMinutes(saved), label: isUnder ? 'Under goal' : 'Over goal'),
              Container(width: 1, height: 32, color: AppColors.border),
              _Stat(value: '${usageState.todayUsage.length}', label: 'Apps tracked'),
            ],
          ),
          if (usageState.todayUsage.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 12),
            ...usageState.todayUsage.take(5).map((app) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 5),
              child: Row(children: [
                Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(8)),
                  child: Center(child: Text(app.appName[0], style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary, fontSize: 13))),
                ),
                const SizedBox(width: 10),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(app.appName, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                    SizedBox(
                      height: 3,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: total > 0 ? app.durationMinutes / total : 0,
                          backgroundColor: AppColors.border,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                )),
                const SizedBox(width: 8),
                Text(formatMinutes(app.durationMinutes), style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary, fontSize: 13)),
              ]),
            )),
          ] else if (!usageState.hasPermission) ...[
            const SizedBox(height: 16),
            Text('Grant Usage Access to see your data', style: TextStyle(color: AppColors.textHint, fontSize: 13)),
          ] else ...[
            const SizedBox(height: 16),
            Text('No usage recorded yet today', style: TextStyle(color: AppColors.textHint, fontSize: 13)),
          ],
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String value, label;
  const _Stat({required this.value, required this.label});
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(value, style: Theme.of(context).textTheme.titleLarge),
      Text(label, style: Theme.of(context).textTheme.bodySmall),
    ]);
  }
}

class _ActionCard extends StatelessWidget {
  final String emoji, title, subtitle;
  final Color color;
  final VoidCallback onTap;
  const _ActionCard({required this.emoji, required this.title, required this.subtitle, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(16)),
          child: Column(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 28)),
              const SizedBox(height: 6),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
              Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}

class _TrackedAppsCard extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tracked = ref.watch(trackedAppsProvider);
    final infos = ref.read(trackedAppsProvider.notifier).trackedAppInfos;

    return GestureDetector(
      onTap: () => context.push('/settings/apps'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: tracked.isEmpty ? AppColors.warmLight : AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: tracked.isEmpty ? AppColors.warm.withOpacity(0.3) : AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: tracked.isEmpty ? AppColors.warm.withOpacity(0.15) : AppColors.primaryLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                tracked.isEmpty ? Icons.warning_amber_rounded : Icons.apps_rounded,
                color: tracked.isEmpty ? AppColors.warm : AppColors.primary,
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tracked.isEmpty ? 'No apps tracked yet' : '${tracked.length} apps tracked',
                    style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    tracked.isEmpty
                        ? 'Tap to select apps to monitor'
                        : infos.take(3).map((a) => a['name']).join(', ') +
                          (infos.length > 3 ? ' +${infos.length - 3} more' : ''),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textHint, size: 20),
          ],
        ),
      ),
    );
  }
}
