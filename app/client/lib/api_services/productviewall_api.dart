// import 'package:dio/dio.dart';
// import 'package:fluttertoast/fluttertoast.dart';
// import '../common/dio_client.dart';
// import '../model/productlistviewall_model.dart';
//
// class ProductViewallServices {
//   final Dio _dio = ApiClient.dio;
//
//   Future<List<ProductListViewall>> allProducts({
//     int? page,
//     int? limit,
//     String? query,
//   }) async {
//     try {
//       final Map<String, dynamic> queryParams = {};
//       if (page != null) queryParams['page'] = page.toString();
//       if (limit != null) queryParams['limit'] = limit.toString();
//       if (query != null && query.isNotEmpty) queryParams['q'] = query;
//
//       var response = await _dio.get('/products/all', queryParameters: queryParams);
//
//       if (response.statusCode == 200) {
//         if (response.data is Map && response.data.containsKey('products')) {
//           List<dynamic> productData = response.data['products'];
//           return productData.map((product) => ProductListViewall.fromJson(product)).toList();
//         } else {
//           throw Exception('Unexpected response data format');
//         }
//       } else {
//         throw Exception('Failed to load products: ${response.statusMessage}');
//       }
//     } on DioException catch (dioError) {
//       if (dioError.response != null) {
//         String errorMessage = dioError.response?.data['message'] ?? dioError.response?.statusMessage ?? "Unknown error occurred.";
//         Fluttertoast.showToast(msg: "Error: $errorMessage");
//       } else {
//         Fluttertoast.showToast(msg: "Error: ${dioError.message}");
//       }
//       rethrow;
//     } catch (e) {
//       Fluttertoast.showToast(msg: "Unexpected error: $e");
//       rethrow;
//     }
//   }
// }


import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../common/dio_client.dart';
import '../model/product_model.dart';

class ProductServices {
  final Dio _dio = ApiClient.dio; // Use your custom Dio client if needed

  Future<List<Products>> fetchAllProducts({
    int? page,
    int? limit,
    String? query,
  }) async {
    try {
      final Map<String, dynamic> queryParams = {};

      // Add parameters only if they are provided
      if (page != null) queryParams['page'] = page.toString();
      if (limit != null) queryParams['limit'] = limit.toString();
      if (query != null && query.isNotEmpty) queryParams['q'] = query;

      // Sending the GET request
      var response = await _dio.get(
        '/products/all',
        queryParameters: queryParams,
      );

      // Check if the response status code is 200 (OK)
      if (response.statusCode == 200) {
        // Ensure the response data is in the expected format (List of products)
        if (response.data is Map && response.data.containsKey('products')) {
          List<dynamic> productData = response.data['products'];

          // Parse the list of products
          List<Products> productList = productData.map((product) {
            return Products.fromJson(product);
          }).toList();

          return productList;
        } else {
          throw Exception('Unexpected response data format');
        }
      } else {
        throw Exception('Failed to load products: ${response.statusMessage}');
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
      Fluttertoast.showToast(msg: "Unexpected error: $e");
      rethrow;
    }
  }
}

