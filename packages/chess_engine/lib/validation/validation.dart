import '../notation/move.dart';
import '../position/board.dart';

class ValidationResult {
  const ValidationResult({
    required this.isLegal,
    this.reason,
  });

  final bool isLegal;
  final String? reason;
}

abstract class PositionValidator {
  const PositionValidator();

  ValidationResult validateMove({
    required ChessBoardState board,
    required ChessMove move,
  });
}