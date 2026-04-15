class DetoxSession {
  final String id;
  final String type;
  final String status;
  final String startedAt;
  final String? endedAt;
  final int targetMinutes;
  final int actualMinutes;
  final List<String> blockedApps;
  final bool completed;

  const DetoxSession({
    required this.id, required this.type, required this.status,
    required this.startedAt, this.endedAt, required this.targetMinutes,
    required this.actualMinutes, required this.blockedApps, required this.completed,
  });

  factory DetoxSession.fromJson(Map<String, dynamic> json) => DetoxSession(
    id: json['id'] as String,
    type: json['type'] as String? ?? 'timer',
    status: json['status'] as String? ?? 'active',
    startedAt: json['startedAt'] as String,
    endedAt: json['endedAt'] as String?,
    targetMinutes: json['targetMinutes'] as int,
    actualMinutes: json['actualMinutes'] as int? ?? 0,
    blockedApps: (json['blockedApps'] as List?)?.cast<String>() ?? [],
    completed: json['completed'] as bool? ?? false,
  );
}

class DetoxChallenge {
  final String id;
  final String title;
  final String description;
  final int durationDays;
  final String difficulty;
  final int participantCount;

  const DetoxChallenge({
    required this.id, required this.title, required this.description,
    required this.durationDays, required this.difficulty, required this.participantCount,
  });

  factory DetoxChallenge.fromJson(Map<String, dynamic> json) => DetoxChallenge(
    id: json['id'] as String,
    title: json['title'] as String,
    description: json['description'] as String,
    durationDays: json['durationDays'] as int,
    difficulty: json['difficulty'] as String? ?? 'medium',
    participantCount: json['participantCount'] as int? ?? 0,
  );
}

class Streak {
  final String id;
  final String type;
  final int currentCount;
  final int longestCount;
  final String? lastActivityDate;

  const Streak({
    required this.id, required this.type,
    required this.currentCount, required this.longestCount,
    this.lastActivityDate,
  });

  factory Streak.fromJson(Map<String, dynamic> json) => Streak(
    id: json['id'] as String,
    type: json['type'] as String,
    currentCount: json['currentCount'] as int? ?? 0,
    longestCount: json['longestCount'] as int? ?? 0,
    lastActivityDate: json['lastActivityDate'] as String?,
  );
}

class LeaderboardEntry {
  final String userId;
  final String displayName;
  final String? avatarUrl;
  final int score;
  final int rank;

  const LeaderboardEntry({
    required this.userId, required this.displayName, this.avatarUrl,
    required this.score, required this.rank,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) => LeaderboardEntry(
    userId: json['userId'] as String,
    displayName: json['displayName'] as String,
    avatarUrl: json['avatarUrl'] as String?,
    score: json['score'] as int? ?? 0,
    rank: json['rank'] as int? ?? 0,
  );
}
