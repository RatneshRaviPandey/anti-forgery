import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';

class PaywallScreen extends StatelessWidget {
  const PaywallScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              Align(
                alignment: Alignment.centerRight,
                child: IconButton(onPressed: () => context.pop(), icon: const Icon(Icons.close, color: AppColors.textHint)),
              ),
              Text('Unlock Your Full\nPotential', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 8),
              Text('Choose the plan that fits your journey', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
              const SizedBox(height: 24),

              // Free
              _TierCard(
                name: 'Free', price: '\$0', period: 'forever', color: AppColors.textSecondary,
                features: ['Basic tracking (7 days)', '2 breathing exercises', '3 meditations', '1 challenge', 'Ad-supported'],
                cta: 'Current Plan', enabled: false,
              ),
              const SizedBox(height: 16),

              // Pro
              _TierCard(
                name: 'Pro', price: '\$6.99', period: '/month', color: AppColors.primary, recommended: true,
                features: ['Everything in Free', 'Ad-free', 'Unlimited analytics', 'All 5 breathing exercises', '20 meditations', 'Unlimited challenges'],
                cta: 'Start 7-Day Free Trial', enabled: true,
              ),
              const SizedBox(height: 16),

              // Premium
              _TierCard(
                name: 'Premium', price: '\$14.99', period: '/month', color: AppColors.accent,
                features: ['Everything in Pro', '100+ meditations', 'Custom breathing patterns', 'PDF reports', 'Family plan (5)', 'Priority support'],
                cta: 'Upgrade to Premium', enabled: true,
              ),
              const SizedBox(height: 16),

              Text('Subscriptions auto-renew. Cancel anytime.',
                  style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _TierCard extends StatelessWidget {
  final String name, price, period, cta;
  final Color color;
  final List<String> features;
  final bool recommended;
  final bool enabled;

  const _TierCard({
    required this.name, required this.price, required this.period,
    required this.color, required this.features, required this.cta,
    this.recommended = false, this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: recommended ? color : AppColors.border, width: recommended ? 2 : 1),
      ),
      child: Column(
        children: [
          if (recommended)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(20)),
              child: const Text('MOST POPULAR', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
            ),
          Text(name, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: color)),
          const SizedBox(height: 4),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Text(price, style: Theme.of(context).textTheme.headlineLarge),
            Text(period, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
          ]),
          const SizedBox(height: 16),
          ...features.map((f) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Row(children: [
              const Text('✓ ', style: TextStyle(color: AppColors.secondary, fontWeight: FontWeight.w700)),
              Expanded(child: Text(f, style: Theme.of(context).textTheme.bodyMedium)),
            ]),
          )),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: recommended
                ? ElevatedButton(onPressed: enabled ? () {} : null, child: Text(cta))
                : OutlinedButton(onPressed: enabled ? () {} : null, child: Text(cta)),
          ),
        ],
      ),
    );
  }
}
