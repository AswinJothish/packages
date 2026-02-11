import 'package:client/model/productdetail_model.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../common/dio_client.dart';

class ProductDetailService {
  final Dio _dio = ApiClient.dio;

  // Existing methods...

  Future<ProductDetails> fetchProductById(String id) async {
    try {
      var response = await _dio.get(
        "/products/get",
        queryParameters: {"id": id},
      );
      if (response.statusCode == 200) {
        return ProductDetails.fromJson(response.data["data"]);
      } else {
        throw Exception('Failed to load product');
      }
    } on DioException catch (dioError) {
      if (dioError.response != null) {
        String errorMessage = dioError.response?.data['message'] ??
            dioError.response?.statusMessage ??
            "Unknown error occurred.";
        Fluttertoast.showToast(msg: "Error: $errorMessage");
      } else {
        Fluttertoast.showToast(msg: "Error: ${dioError.message}");
      }
      rethrow;
    } catch (e) {
      throw Exception('Error fetching product: $e');
    }
  }
}
