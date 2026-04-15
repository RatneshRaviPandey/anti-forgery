import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../services/platform_channels.dart';

class PermissionBanner extends StatefulWidget {
  final VoidCallback? onGranted;
  const PermissionBanner({super.key, this.onGranted});

  @override
  State<PermissionBanner> createState() => _PermissionBannerState();
}

class _PermissionBannerState extends State<PermissionBanner> with WidgetsBindingObserver {
  bool _dismissed = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // When user returns from Settings, re-check permission
    if (state == AppLifecycleState.resumed) {
      widget.onGranted?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_dismissed) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.warmLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.warm.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Text('📊', style: TextStyle(fontSize: 28)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Enable Usage Access',
                  style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 2),
                Text(
                  'Grant permission to track your screen time',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            children: [
              ElevatedButton(
                onPressed: () => UsageTrackerService().requestPermission(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.warm,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  minimumSize: const Size(0, 36),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                child: const Text('Grant', style: TextStyle(fontSize: 13)),
              ),
              const SizedBox(height: 4),
              GestureDetector(
                onTap: () => setState(() => _dismissed = true),
                child: Text('Dismiss', style: TextStyle(fontSize: 11, color: AppColors.textHint)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
