class Opening {
  const Opening({
    required this.id,
    required this.name,
    required this.eco,
    this.category,
  });

  final String id;
  final String name;
  final String eco;
  final String? category;
}