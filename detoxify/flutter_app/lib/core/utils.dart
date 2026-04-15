import 'dart:math';

String formatMinutes(int minutes) {
  if (minutes < 60) return '${minutes}m';
  final h = minutes ~/ 60;
  final m = minutes % 60;
  return m > 0 ? '${h}h ${m}m' : '${h}h';
}

String formatSeconds(int seconds) {
  final m = seconds ~/ 60;
  final s = seconds % 60;
  return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
}

String formatTimer(int totalSeconds) {
  final m = totalSeconds ~/ 60;
  final s = totalSeconds % 60;
  return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
}

String getGreeting() {
  final h = DateTime.now().hour;
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

String getDateString([DateTime? date]) {
  final d = date ?? DateTime.now();
  return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}

int percentChange(int current, int previous) {
  if (previous == 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous * 100).round();
}

int calculateLevel(int xp) {
  int level = 1;
  int required = 100;
  int total = 0;
  while (xp >= total + required) {
    total += required;
    level++;
    required = (100 * pow(1.2, level - 1)).floor();
  }
  return level;
}

int xpToNextLevel(int xp) {
  int level = 1;
  int required = 100;
  int total = 0;
  while (xp >= total + required) {
    total += required;
    level++;
    required = (100 * pow(1.2, level - 1)).floor();
  }
  return required - (xp - total);
}

final _random = Random();
const _quotes = [
  'Every moment offline is a moment invested in yourself.',
  'Your mind deserves a break from the scroll.',
  'Real connections happen when you look up from the screen.',
  'Progress, not perfection. You\'re doing great.',
  'The best things in life aren\'t on a screen.',
  'Be present. The world is beautiful right here.',
  'Your attention is your most valuable resource.',
  'Small steps lead to big changes.',
  'You\'re stronger than the urge to scroll.',
  'This moment of stillness is a gift to yourself.',
  'Breathe in calm, breathe out stress.',
  'Your peace of mind is worth more than any notification.',
];

String getMotivationalQuote() => _quotes[_random.nextInt(_quotes.length)];
