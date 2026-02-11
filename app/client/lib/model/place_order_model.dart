class OrderRequest {
  final String orderedBy;
  final String customerId;
  final List<Map<String,dynamic>> products;
  final Map<String,dynamic> deliveryAddress;
  final int deliveryCharges;
  final int grandTotal;

  OrderRequest({
    required this.orderedBy,
    required this.customerId,
    required this.products,
    required this.deliveryAddress,
    required this.deliveryCharges,
    required this.grandTotal,
  });


}
