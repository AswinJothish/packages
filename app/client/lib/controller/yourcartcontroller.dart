import 'package:client/model/yourcart_model/getcart_model.dart';
import 'package:get/get.dart';
import '../api_services/yourcart_api.dart';

class Yourcartcontroller extends GetxController {
  final YourcartApi _apiService = YourcartApi();

  var cartItems = [];
  var isLoading = false.obs;
  var errorMessage = ''.obs;

  // Method to add item to cart
  Future<bool> addToCart({
    required String userId,
    required String productId,
    required int quantity,
  }) async {
    try {
      isLoading.value = true;
      final response = await _apiService.addToCart(
        userId: userId,
        productId: productId,
        quantity: quantity,
      );
      if (response) {
        return true;
      } else {
        // errorMessage.value = response['message'] ?? 'Failed to add to cart';
        return false;
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: $e';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Method to get cart items
  Future<GetCartItem?> getCartItems({required String userId}) async {
    try {
      isLoading.value = true; // Indicate loading state
      final response = await _apiService.getCartItems(userId: userId);

      if (response != null) {
       return response;
      } else {
        errorMessage.value;
        return null;
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: $e';
      return null; // Return false on error
    } finally {
      isLoading.value = false; // Ensure loading is reset
    }
  }

  // Method to delete item from cart
  Future<bool> deleteCartItem({
    required String userId,
    required String cartItemId,
  }) async {
    try {
      isLoading.value = true;
      bool response = await _apiService.deleteCartItem(
        userId: userId,
        cartItemId: cartItemId,
      );
      if (response) {
        await getCartItems(userId: userId);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: $e';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
