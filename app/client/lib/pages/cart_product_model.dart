class Product {
  final String id;
  final String name;
  final double price;
  final int stock;
  int quantityInCart;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.stock,
    required this.quantityInCart,
  });
}
