import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/utils.dart';
import '../auth/auth_provider.dart';

class DetoxTimerScreen extends ConsumerStatefulWidget {
  final int targetMinutes;
  const DetoxTimerScreen({super.key, this.targetMinutes = 30});

  @override
  ConsumerState<DetoxTimerScreen> createState() => _DetoxTimerScreenState();
}

class _DetoxTimerScreenState extends ConsumerState<DetoxTimerScreen> {
  late int _secondsRemaining;
  String _state = 'idle'; // idle, running, paused, completed
  Timer? _timer;
  String _quote = getMotivationalQuote();

  @override
  void initState() {
    super.initState();
    _secondsRemaining = widget.targetMinutes * 60;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _start() {
    setState(() => _state = 'running');
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_secondsRemaining <= 1) {
        _timer?.cancel();
        setState(() { _secondsRemaining = 0; _state = 'completed'; });
      } else {
        setState(() => _secondsRemaining--);
      }
    });
    // Rotate quotes
    Timer.periodic(const Duration(seconds: 30), (t) {
      if (_state != 'running') { t.cancel(); return; }
      setState(() => _quote = getMotivationalQuote());
    });
  }

  void _pause() {
    _timer?.cancel();
    setState(() => _state = 'paused');
  }

  void _resume() {
    setState(() => _state = 'running');
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_secondsRemaining <= 1) {
        _timer?.cancel();
        setState(() { _secondsRemaining = 0; _state = 'completed'; });
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  double get _progress => 1.0 - (_secondsRemaining / (widget.targetMinutes * 60));

  @override
  Widget build(BuildContext context) {
    final minutes = _secondsRemaining ~/ 60;
    final seconds = _secondsRemaining % 60;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              if (_state == 'idle')
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(
                    onPressed: () => context.pop(),
                    child: const Text('← Back', style: TextStyle(color: AppColors.textHint)),
                  ),
                ),
              const Spacer(),

              if (_state == 'completed') ...[
                const Text('🎉', style: TextStyle(fontSize: 64)),
                const SizedBox(height: 16),
                const Text('Session Complete!', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: Colors.white)),
                const SizedBox(height: 8),
                Text('You stayed focused for ${widget.targetMinutes} minutes',
                    style: const TextStyle(color: AppColors.textHint, fontSize: 16)),
                const SizedBox(height: 16),
                const Text('+25 XP earned', style: TextStyle(color: AppColors.secondary, fontSize: 18, fontWeight: FontWeight.w600)),
              ] else ...[
                Text(
                  _state == 'idle' ? 'Ready to focus?' : _state == 'paused' ? 'Paused' : 'Stay focused...',
                  style: const TextStyle(color: AppColors.textHint, fontSize: 16),
                ),
                const SizedBox(height: 24),
                Text(
                  '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}',
                  style: const TextStyle(fontSize: 72, fontWeight: FontWeight.w200, color: Colors.white, fontFeatures: [FontFeature.tabularFigures()]),
                ),
                const SizedBox(height: 8),
                Text('${widget.targetMinutes} minute session', style: const TextStyle(color: AppColors.textHint)),
                const SizedBox(height: 24),
                ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: LinearProgressIndicator(value: _progress, minHeight: 4,
                      backgroundColor: AppColors.darkBorder, color: AppColors.primary),
                ),
              ],

              const Spacer(),

              if (_state == 'running')
                Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: Text('"$_quote"', textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textHint, fontStyle: FontStyle.italic)),
                ),

              if (_state == 'idle')
                ElevatedButton(onPressed: _start, child: const Text('Start Session')),
              if (_state == 'running') ...[
                OutlinedButton(onPressed: _pause, style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.white30)),
                    child: const Text('Pause', style: TextStyle(color: Colors.white))),
                TextButton(onPressed: () => context.pop(), child: const Text('End Early', style: TextStyle(color: AppColors.textHint))),
              ],
              if (_state == 'paused') ...[
                ElevatedButton(onPressed: _resume, child: const Text('Resume')),
                TextButton(onPressed: () => context.pop(), child: const Text('End Session', style: TextStyle(color: AppColors.textHint))),
              ],
              if (_state == 'completed')
                ElevatedButton(onPressed: () => context.pop(), child: const Text('Done')),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
