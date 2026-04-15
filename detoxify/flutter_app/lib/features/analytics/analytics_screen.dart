import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/utils.dart';
import '../home/usage_tracking_provider.dart';
import '../settings/goals_provider.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usageState = ref.watch(usageTrackingProvider);
    final total = usageState.totalMinutes;
    final goalMinutes = ref.watch(goalsProvider).dailyGoalMinutes;
    final saved = total <= goalMinutes ? goalMinutes - total : 0;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            const SizedBox(height: 16),
            GestureDetector(
              onTap: () => context.pop(),
              child: Text('← Back', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 8),
            Text('Analytics', style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 24),

            // Summary cards
            Row(children: [
              _SummaryCard('Today', formatMinutes(total)),
              const SizedBox(width: 12),
              _SummaryCard('Goal', formatMinutes(goalMinutes)),
              const SizedBox(width: 12),
              _SummaryCard('Saved', formatMinutes(saved)),
            ]),
            const SizedBox(height: 24),

            // App breakdown
            Text("Today's Breakdown", style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            if (usageState.todayUsage.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                child: Center(child: Text(
                  usageState.hasPermission ? 'No usage data yet' : 'Grant Usage Access to see data',
                  style: TextStyle(color: AppColors.textSecondary),
                )),
              )
            else
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                child: Column(
                  children: usageState.todayUsage.asMap().entries.map((e) {
                    final i = e.key;
                    final app = e.value;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(children: [
                        SizedBox(width: 24, child: Text('${i + 1}', style: TextStyle(color: AppColors.textHint, fontWeight: FontWeight.w600))),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(app.appName, style: const TextStyle(fontWeight: FontWeight.w500)),
                            const SizedBox(height: 4),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(2),
                              child: LinearProgressIndicator(
                                value: total > 0 ? app.durationMinutes / total : 0,
                                minHeight: 4, backgroundColor: AppColors.border, color: AppColors.primary,
                              ),
                            ),
                          ]),
                        ),
                        const SizedBox(width: 12),
                        Text(formatMinutes(app.durationMinutes), style: TextStyle(fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                      ]),
                    );
                  }).toList(),
                ),
              ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String label, value;
  const _SummaryCard(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
        child: Column(children: [
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.primary)),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ]),
      ),
    );
  }
}
