enum Difficulty { beginner, intermediate, advanced, expert }

class Trap {
  const Trap({
    required this.id,
    required this.openingId,
    required this.title,
    required this.difficulty,
    this.ratingMin,
    this.ratingMax,
    this.version = 1,
  });

  final String id;
  final String openingId;
  final String title;
  final Difficulty difficulty;
  final int? ratingMin;
  final int? ratingMax;
  final int version;
}

class Scenario {
  const Scenario({
    required this.id,
    required this.trapId,
    required this.fen,
    required this.solution,
    required this.hint,
    required this.explanation,
    this.wrongMoves = const <String>[],
  });

  final String id;
  final String trapId;
  final String fen;
  final String solution;
  final String hint;
  final String explanation;
  final List<String> wrongMoves;
}