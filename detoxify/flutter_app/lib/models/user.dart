class User {
  final String id;
  final String email;
  final String displayName;
  final String? avatarUrl;
  final String tier;
  final int dailyGoalMinutes;
  final String timezone;
  final bool onboarded;
  final int xp;
  final String? inviteCode;
  final String createdAt;

  const User({
    required this.id, required this.email, required this.displayName,
    this.avatarUrl, required this.tier, required this.dailyGoalMinutes,
    required this.timezone, required this.onboarded, this.xp = 0,
    this.inviteCode, required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] as String,
    email: json['email'] as String,
    displayName: json['displayName'] as String,
    avatarUrl: json['avatarUrl'] as String?,
    tier: json['tier'] as String? ?? 'free',
    dailyGoalMinutes: json['dailyGoalMinutes'] as int? ?? 120,
    timezone: json['timezone'] as String? ?? 'UTC',
    onboarded: json['onboarded'] as bool? ?? false,
    xp: json['xp'] as int? ?? 0,
    inviteCode: json['inviteCode'] as String?,
    createdAt: json['createdAt'] as String,
  );

  User copyWith({bool? onboarded, int? dailyGoalMinutes, String? tier, int? xp}) => User(
    id: id, email: email, displayName: displayName, avatarUrl: avatarUrl,
    tier: tier ?? this.tier,
    dailyGoalMinutes: dailyGoalMinutes ?? this.dailyGoalMinutes,
    timezone: timezone,
    onboarded: onboarded ?? this.onboarded,
    xp: xp ?? this.xp,
    inviteCode: inviteCode, createdAt: createdAt,
  );
}

class AuthState {
  final User? user;
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isAuthenticated = false, this.isLoading = false, this.error});

  AuthState copyWith({User? user, bool? isAuthenticated, bool? isLoading, String? error}) =>
      AuthState(
        user: user ?? this.user,
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}
