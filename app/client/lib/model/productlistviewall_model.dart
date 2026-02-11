class ProductListViewall {
  final String id;
  final String name;
  final String brand;
  final String amount;
  final String inclusiveGst;
  final String offerName;
  final String viewOffer;

  ProductListViewall({
    required this.id,
    required this.name,
    required this.brand,
    required this.amount,
    required this.inclusiveGst,
    required this.offerName,
    required this.viewOffer,
  });

  // Factory method to create an instance from JSON
  factory ProductListViewall.fromJson(Map<String, dynamic> json) {
    return ProductListViewall(
      id: json['id'] as String,
      name: json['name'] as String,
      brand: json['brand'] as String,
      amount: json['amount'] as String,
      inclusiveGst: json['inclusiveGst'] as String,
      offerName: json['offerName'] as String,
      viewOffer: json['viewOffer'] as String,
    );
  }

  // Optionally, you can add a toJson method if you need to convert it back to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'amount': amount,
      'inclusiveGst': inclusiveGst,
      'offerName': offerName,
      'viewOffer': viewOffer,
    };
  }
}
