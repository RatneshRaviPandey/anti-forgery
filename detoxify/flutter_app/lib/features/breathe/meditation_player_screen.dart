import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/utils.dart';

class MeditationPlayerScreen extends StatefulWidget {
  final String sessionId;
  const MeditationPlayerScreen({super.key, required this.sessionId});

  @override
  State<MeditationPlayerScreen> createState() => _MeditationPlayerScreenState();
}

class _MeditationPlayerScreenState extends State<MeditationPlayerScreen> {
  // In production: use just_audio package for real audio playback
  String _playerState = 'ready'; // ready, playing, paused, completed

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              Align(
                alignment: Alignment.centerRight,
                child: IconButton(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.close, color: AppColors.textHint, size: 28),
                ),
              ),
              const Spacer(),
              Container(
                width: 160, height: 160,
                decoration: BoxDecoration(color: AppColors.darkSurface, borderRadius: BorderRadius.circular(24)),
                child: const Center(child: Text('🧘', style: TextStyle(fontSize: 64))),
              ),
              const SizedBox(height: 24),
              const Text('Meditation Session', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white)),
              const SizedBox(height: 8),
              const Text('Calm your mind', style: TextStyle(color: AppColors.textHint)),
              const Spacer(),
              ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text('Done'),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
