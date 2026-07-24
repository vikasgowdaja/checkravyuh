class ChessMove {
  const ChessMove({
    required this.from,
    required this.to,
    this.promotion,
  });

  final String from;
  final String to;
  final String? promotion;

  @override
  String toString() => promotion == null ? '$from$to' : '$from$to$promotion';
}