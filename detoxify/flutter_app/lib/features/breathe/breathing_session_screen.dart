import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/constants.dart';

class BreathingSessionScreen extends StatefulWidget {
  final String exerciseId;
  const BreathingSessionScreen({super.key, required this.exerciseId});

  @override
  State<BreathingSessionScreen> createState() => _BreathingSessionScreenState();
}

class _BreathingSessionScreenState extends State<BreathingSessionScreen> with SingleTickerProviderStateMixin {
  late final BreathingExerciseData _exercise;
  late AnimationController _animCtrl;
  late Animation<double> _scaleAnim;

  String _sessionState = 'ready'; // ready, active, completed
  int _currentStep = 0;
  int _cyclesCompleted = 0;
  int _totalSeconds = 0;
  final int _targetCycles = 6;
  Timer? _stepTimer;
  Timer? _durationTimer;

  @override
  void initState() {
    super.initState();
    _exercise = breathingExercises.firstWhere((e) => e.id == widget.exerciseId, orElse: () => breathingExercises.first);
    _animCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 4));
    _scaleAnim = Tween<double>(begin: 0.5, end: 1.0).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _stepTimer?.cancel();
    _durationTimer?.cancel();
    super.dispose();
  }

  void _start() {
    setState(() { _sessionState = 'active'; _cyclesCompleted = 0; _totalSeconds = 0; _currentStep = 0; });
    _durationTimer = Timer.periodic(const Duration(seconds: 1), (_) => setState(() => _totalSeconds++));
    _runStep();
  }

  void _runStep() {
    if (_sessionState != 'active') return;
    final step = _exercise.steps[_currentStep];

    // Animate based on phase
    _animCtrl.duration = Duration(seconds: step.durationSeconds);
    if (step.phase == 'inhale') {
      _scaleAnim = Tween<double>(begin: 0.5, end: 1.0).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeInOut));
      _animCtrl.forward(from: 0);
    } else if (step.phase == 'exhale') {
      _scaleAnim = Tween<double>(begin: 1.0, end: 0.5).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeInOut));
      _animCtrl.forward(from: 0);
    }
    // Hold: no animation change

    _stepTimer = Timer(Duration(seconds: step.durationSeconds), () {
      final nextIdx = _currentStep + 1;
      if (nextIdx >= _exercise.steps.length) {
        final newCycles = _cyclesCompleted + 1;
        if (newCycles >= _targetCycles) {
          _complete();
          return;
        }
        setState(() { _cyclesCompleted = newCycles; _currentStep = 0; });
      } else {
        setState(() => _currentStep = nextIdx);
      }
      _runStep();
    });
  }

  void _complete() {
    _stepTimer?.cancel();
    _durationTimer?.cancel();
    setState(() => _sessionState = 'completed');
  }

  String get _phaseLabel {
    if (_sessionState != 'active') return '';
    switch (_exercise.steps[_currentStep].phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return '';
    }
  }

  Color get _phaseColor {
    if (_sessionState != 'active') return AppColors.primary;
    switch (_exercise.steps[_currentStep].phase) {
      case 'inhale': return AppColors.primary;
      case 'hold': return AppColors.accent;
      case 'exhale': return AppColors.secondary;
      default: return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 32),
              Text(_exercise.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white)),
              const SizedBox(height: 8),
              Text(
                _sessionState == 'active' ? 'Cycle ${_cyclesCompleted + 1} of $_targetCycles' : _exercise.description,
                style: const TextStyle(color: AppColors.textHint), textAlign: TextAlign.center,
              ),

              const Spacer(),

              if (_sessionState == 'completed') ...[
                const Text('✨', style: TextStyle(fontSize: 56)),
                const SizedBox(height: 16),
                const Text('Well Done!', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: Colors.white)),
                const SizedBox(height: 8),
                Text('$_cyclesCompleted cycles • ${_totalSeconds ~/ 60} min',
                    style: const TextStyle(color: AppColors.textHint, fontSize: 16)),
                const SizedBox(height: 16),
                const Text('+15 XP', style: TextStyle(color: AppColors.secondary, fontSize: 18, fontWeight: FontWeight.w600)),
              ] else ...[
                // Breathing circle
                AnimatedBuilder(
                  animation: _scaleAnim,
                  builder: (_, __) => Transform.scale(
                    scale: _sessionState == 'active' ? _scaleAnim.value : 0.75,
                    child: Container(
                      width: 200, height: 200,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _phaseColor.withOpacity(0.5),
                      ),
                      child: Center(
                        child: _sessionState == 'active'
                            ? Text(_phaseLabel, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600))
                            : const Text('Tap Start', style: TextStyle(color: AppColors.textHint, fontSize: 16)),
                      ),
                    ),
                  ),
                ),
              ],

              const Spacer(),

              if (_sessionState == 'ready') ...[
                ElevatedButton(onPressed: _start, child: const Text('Start')),
                TextButton(onPressed: () => context.pop(), child: const Text('Back', style: TextStyle(color: AppColors.textHint))),
              ],
              if (_sessionState == 'active')
                OutlinedButton(
                  onPressed: _complete,
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.white30)),
                  child: const Text('Stop', style: TextStyle(color: Colors.white)),
                ),
              if (_sessionState == 'completed')
                ElevatedButton(onPressed: () => context.pop(), child: const Text('Done')),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
