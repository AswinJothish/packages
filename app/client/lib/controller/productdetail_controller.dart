import 'package:dio/dio.dart';
import '../api_services/productdetail_api.dart';
import '../common/common.dart';
import '../model/product_model.dart';
import '../model/productdetail_model.dart';

class ProductDetailController {
  final ProductDetailService _productServices = ProductDetailService();

  // Method to fetch a single product by ID
  Future<ProductDetails?> fetchProductById(String productId) async {
    try {
      ProductDetails response = await _productServices.fetchProductById(productId); // Adjust the endpoint as needed
      return response;
          return null;

    } catch (e) {
      throw Exception('Error fetching product: $e');
    }
  }
}
