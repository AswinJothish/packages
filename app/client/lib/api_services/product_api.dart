
import 'package:client/model/categories_model.dart';
import 'package:client/model/product_model.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../common/dio_client.dart';

class ProductServices {
  final Dio _dio = ApiClient.dio; // Use your custom Dio client if needed

  //Home Page our product api

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
          for (var item in productData) {
            item.forEach((key, value) {
              print('Key: $key, Value: $value');
            });
          }

          // Parse the list of products
          // List<Products> productList = productData.map((product) {
          //   return Products.fromJson(product);
          // }).toList();
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

//Home page new products

  Future<Map<String, dynamic>> fetchNewProducts({int page = 1, int limit = 10, String? query}) async {
    try {
      final response = await _dio.get(
        '/products/newProduct',
        queryParameters: {
          'page': page,
          'limit': limit,
          'q': query ?? '',
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final products = (data['products'] as List)
            .map((product) => Products.fromJson(product))
            .toList();

        return {
          'ok': data['ok'],
          'message': data['message'],
          'products': products,
          'total': data['total'],
        };
      } else {
        throw Exception('Failed to load products: ${response.statusCode}');
      }
    } catch (error) {
      print(error);
      throw Exception('Failed to load products: ${error.toString()}');
    }
  }

  //Category Ui show Api
  Future<CategoryModel> fetchCategories() async {
    try {
      final response = await _dio.get('/products/category');

      if (response.statusCode == 200) {
        return CategoryModel.fromJson(response.data);  // Parse JSON response
      } else {
        throw Exception('Failed to load categories: ${response.data}');
      }
    } catch (error) {
      throw Exception('Failed to load categories: ${error.toString()}');
    }
  }

  //Category product api
  Future<Map<String, dynamic>> fetchProductsByCategory({
    required String categoryName,
    String? priceSort,
    String? dateSort,
    String? searchQuery,
    String? status,
  }) async {
    try {
      // Construct query parameters
      Map<String, dynamic> queryParameters = {
        'categoryName': categoryName,
        if (priceSort != null) 'priceSort': priceSort,
        if (dateSort != null) 'dateSort': dateSort,
        if (searchQuery != null) 'q': searchQuery,
      };
      final response = await _dio.get('/products/getProducts-category',queryParameters: queryParameters,);

      // Check if the response is successful
      if (response.statusCode == 200) {
        return response.data;
      } else {
        throw Exception('Failed to load products');
      }
    } on DioException catch (error) {
      print("Error fetching products: ${error.response?.data}");
      return {
        'ok': false,
        'message': 'Error fetching products: ${error.message}',
      };
    } catch (error) {
      print("Unexpected error: $error");
      return {
        'ok': false,
        'message': 'Unexpected error occurred.',
      };
    }
  }


}
