class AppUsage {
  final String appName;
  final String packageName;
  final int durationMinutes;
  final int percentOfTotal;

  const AppUsage({
    required this.appName, required this.packageName,
    required this.durationMinutes, required this.percentOfTotal,
  });

  factory AppUsage.fromJson(Map<String, dynamic> json) => AppUsage(
    appName: json['appName'] as String,
    packageName: json['packageName'] as String,
    durationMinutes: json['durationMinutes'] as int? ?? 0,
    percentOfTotal: json['percentOfTotal'] as int? ?? 0,
  );
}

class DailyUsageSummary {
  final String date;
  final int totalMinutes;
  final int goalMinutes;
  final List<AppUsage> apps;
  final int savedMinutes;

  const DailyUsageSummary({
    required this.date, required this.totalMinutes, required this.goalMinutes,
    required this.apps, required this.savedMinutes,
  });

  factory DailyUsageSummary.fromJson(Map<String, dynamic> json) => DailyUsageSummary(
    date: json['date'] as String,
    totalMinutes: json['totalMinutes'] as int? ?? 0,
    goalMinutes: json['goalMinutes'] as int? ?? 120,
    apps: (json['apps'] as List?)?.map((e) => AppUsage.fromJson(e)).toList() ?? [],
    savedMinutes: json['savedMinutes'] as int? ?? 0,
  );

  double get progress => goalMinutes > 0 ? (totalMinutes / goalMinutes).clamp(0.0, 1.0) : 0;
  bool get isUnderGoal => totalMinutes <= goalMinutes;
}

class TrendPoint {
  final String date;
  final int minutes;
  const TrendPoint({required this.date, required this.minutes});

  factory TrendPoint.fromJson(Map<String, dynamic> json) => TrendPoint(
    date: json['date'] as String,
    minutes: json['minutes'] as int? ?? 0,
  );
}
