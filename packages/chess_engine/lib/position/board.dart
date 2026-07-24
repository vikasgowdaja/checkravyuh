import '../notation/fen.dart';
import '../notation/move.dart';

class ChessBoardState {
  const ChessBoardState({
    required this.position,
    this.moves = const <ChessMove>[],
  });

  final Fen position;
  final List<ChessMove> moves;
}