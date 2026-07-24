enum MoveOutcome { correct, incorrect, hintRequested, completed }

class MoveResult {
  const MoveResult({
    required this.move,
    required this.outcome,
    this.feedback,
  });

  final String move;
  final MoveOutcome outcome;
  final String? feedback;
}

enum PracticeStatus { active, completed, abandoned }

class PracticeSessionRecord {
  const PracticeSessionRecord({
    required this.id,
    required this.trapId,
    required this.startedAt,
    required this.status,
    this.completedAt,
    this.mistakes = 0,
  });

  final String id;
  final String trapId;
  final DateTime startedAt;
  final PracticeStatus status;
  final DateTime? completedAt;
  final int mistakes;

  bool get isCompleted => status == PracticeStatus.completed;
}

class ReviewQueueItem {
  const ReviewQueueItem({
    required this.trapId,
    required this.priority,
    required this.dueAt,
  });

  final String trapId;
  final int priority;
  final DateTime dueAt;
}