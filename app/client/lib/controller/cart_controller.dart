import 'package:get/get.dart';
import '../pages/cart_product_model.dart';

class CartController extends GetxController {
  final List<Product> cartItems = [];

  // Check how many of the product is currently in the cart
  int getProductQuantityInCart(String productId) {
    final product = cartItems.firstWhere(
          (item) => item.id == productId,
      orElse: () => Product(id: productId, name: '', price: 0, stock: 0, quantityInCart: 0),
    );
    return product.quantityInCart;
  }

  // Add to cart
  Future<bool> addToCart({
    required String userId,
    required String productId,
    required int quantity,
  }) async {
    final existingQuantity = getProductQuantityInCart(productId);
    final product = cartItems.firstWhere(
          (item) => item.id == productId,
      orElse: () => Product(id: productId, name: '', price: 0, stock: 0, quantityInCart: 0),
    );

    // Check if the requested quantity exceeds available stock
    if (existingQuantity + quantity > product.stock) {
      return false; // Not enough stock
    }

    // If the product is already in the cart, check if the total quantity exceeds stock
    if (existingQuantity > 0) {
      product.quantityInCart += quantity;
    } else {
      // If the product is not already in the cart, add it
      cartItems.add(Product(
        id: productId,
        name: 'Product Name', // Change this to use actual product name
        price: 0, // Set actual price
        stock: product.stock, // Set actual stock
        quantityInCart: quantity,
      ));
    }
    return true;
  }
}
