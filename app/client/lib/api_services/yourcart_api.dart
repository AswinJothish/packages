import 'dart:convert';
import 'dart:developer';
import 'dart:math';

import 'package:client/model/addaddress_model.dart';
import 'package:client/model/order_model.dart';
import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../common/dio_client.dart';
import '../model/get_address_model.dart';
import '../model/orderedit_model.dart';
import '../model/place_order_model.dart';
import '../model/yourcart_model/getcart_model.dart';

class YourcartApi {
  final Dio _dio = ApiClient.dio;

  // Add to Cart API
  Future<bool> addToCart({
    required String userId,
    required String productId,
    required int quantity,
  }) async {
    try {
      final response = await _dio.post('/order/addToCart', data: {
        'userId': userId,
        'productId': productId,
        'quantity': quantity,
      });
      if (response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } on DioException {
      return false;
    }
  }

  // Get Cart Items API
  Future<GetCartItem?> getCartItems({required String userId}) async {
    try {
      final response = await _dio.get('/order/getCartItems', queryParameters: {
        'Id': userId,
      });

      if (response.statusCode == 200) {
        GetCartItem getCartItem = GetCartItem.fromJson(response.data);
        if (getCartItem.cart != null && getCartItem.cart!.isNotEmpty) {
          return getCartItem;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } on DioException catch (e) {
      print("Error fetching cart items: ${e.message}");
      return null;
    }
  }

  // Delete Cart Item API
  Future<bool> deleteCartItem({
    required String userId,
    required String cartItemId,
  }) async {
    try {
      var response =
          await _dio.delete('/order/deleteCartItem', queryParameters: {
        'userId': userId,
        'cartItemId': cartItemId,
      });
      if (response.statusCode == 200) {
        if (response.data["status"] == 200) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } on DioException {
      return false;
    }
  }

  // Create Order API
  Future<Map<String, dynamic>> createOrder({
    required String orderedBy,
    required String customerId,
    required List<Map<String, dynamic>> products,
    required Map<String, dynamic> deliveryAddress,
    required double deliveryCharges,
    required double grandTotal,
  }) async {
    try {
      final response = await _dio.post('/order/create', data: {
        'orderedBy': orderedBy,
        'customerId': customerId,
        'products': products,
        'deliveryAddress': deliveryAddress,
        'deliveryCharges': deliveryCharges,
        'grandTotal': grandTotal,
      });
      return response.data;
    } on DioException catch (e) {
      return {'status': e.response?.statusCode, 'message': e.message};
    }
  }

  // Get Orders by User ID API
  Future<OrderModel?> getUserOrders({required String userId,String? status, String? timeFilter}) async {
    try {
      final response = await _dio.get('/order/get', queryParameters: {
        'id': userId,
        'status' : status,
        'timeFilter' : timeFilter
      });
      if (response.statusCode == 200) {
        print("Order List data ${response.data.toString()}");
        OrderModel orderModel = OrderModel.fromJson(response.data);
        return orderModel;
      } else {
        return null;
      }
    } on DioException catch (e) {
      print(e.toString());
    }
    return null;
  }

  // GetOrders edit history by User ID API
  Future<OrderEditModel?> getOrders({required String userId}) async {
    try {
      final response = await _dio.get('/order/getOrder', queryParameters: {
        'Id': userId,
      });
      if (response.statusCode == 200) {
        print("Order data ${response.data.toString()}");
        OrderEditModel orderEditModelModel =
            OrderEditModel.fromJson(response.data);
        return orderEditModelModel;
      } else {
        return null;
      }
    } on DioException catch (e) {
      print(e.toString());
    }
    return null;
  }

//Put method edit-Order
  Future<Map<String, dynamic>> editOrder({
    required String orderId,
    String? paymentImage, // This can be a file path or base64 string
    String? transactionId,
  }) async {
    try {
      FormData formData = FormData.fromMap({
        'transactionId': transactionId ?? "",
        if (paymentImage != null)
          'paymentImage': await MultipartFile.fromFile(
            paymentImage,
            filename: (paymentImage),
          ),
      });
      printFormData(formData);

      final response = await _dio.put(
        '/order/edit-order',
        queryParameters: {
          'id': orderId,
        },
        data: formData,
      );

      // Check if the request was successful
      if (response.statusCode == 200) {
        return {
          'ok': true,
          'message': 'Order updated successfully',
          'data': response.data,
        };
      } else {
        return {
          'ok': false,
          'message': response.data['message'] ?? 'Failed to update order',
        };
      }
    } catch (e) {
      return {
        'ok': false,
        'message': e.toString(),
      };
    }
  }

  void printFormData(FormData formData) {
    for (var field in formData.fields) {
      print("Field: ${field.key} = ${field.value}");
    }

    for (var file in formData.files) {
      print("File: ${file.key} = ${file.value}");
    }
  }

  //add address api
  Future<dynamic> addAddress(AddAddressModel newAddress) async {
    // Ensure that tag is set
    if (newAddress.tag == null || newAddress.tag!.isEmpty) {
      return {
        'status': 400,
        'message': 'Tag is required.',
      };
    }

    try {
      Map<String, dynamic> data = {
        'customerId': newAddress.customerId,
        'tag': newAddress.tag, // Changed from 'tagName' to 'tag'
        'address': {
          'flatNumber': newAddress.address?.flatNumber,
          'area': newAddress.address?.area,
          'nearbyLandmark': newAddress.address?.nearbyLandmark,
          'receiverName': newAddress.address?.receiverName,
          'receiverMobileNumber': newAddress.address?.receiverMobileNumber,
        },
      };

      print('Request data: $data'); // Debugging print

      var response = await _dio.post('/order/updateAddress', data: data);

      if (response.statusCode == 200) {
        var responseData = response.data;
        return responseData;
      } else {
        return {
          'status': response.statusCode,
          'message': 'Unexpected error: ${response.statusMessage}',
        };
      }
    } on DioException catch (e) {
      return {
        'status': e.response?.statusCode,
        'message': e.message,
      };
    } catch (e) {
      return {
        'status': 500,
        'message': 'An unexpected error occurred: ${e.toString()}',
      };
    }
  }

  //Get address api
  Future<GetAddressModel?> getAddress(String customerId) async {
    try {
      var response = await _dio.get('/users/getAddress?id=$customerId');

      if (response.statusCode == 200) {
        GetAddressModel getAddressModel =
            GetAddressModel.fromJson(response.data);
        return getAddressModel;
      } else {
        Fluttertoast.showToast(msg: "Error: ${response.data["message"]}");
        return null;
      }
    } catch (error) {
      Fluttertoast.showToast(msg: "Error: ${e.toString()}");
    }
    return null;
  }

  //Delete Address api

  Future<bool> deleteAddress(String customerId, String addressId) async {
    try {
      final response = await _dio.delete(
        '/users/deleteAddress',
        queryParameters: {
          'customerId': customerId,
          'addressId': addressId,
        },
      );

      if (response.statusCode == 200) {
        return true;
      }
      return false;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        print("Address not found. Please add a new address.");
      } else {
        print(
            "Failed to delete address: ${e.response?.data['message'] ?? 'Unknown error'}");
        return false;
      }
      return false;
    } catch (e) {
      print("Unexpected error occurred: $e");
      return false;
    }
  }

  //Edit Address api

  Future<dynamic> editAddress(AddAddressModel editAddress) async {
    try {
      Map<String, dynamic> data = {
        'userId': editAddress.customerId,
        'address': {
          '_id': editAddress.address?.id,
          'tag': editAddress.tag,
          'flatNumber': editAddress.address?.flatNumber,
          'area': editAddress.address?.area,
          'nearbyLandmark': editAddress.address?.nearbyLandmark,
          'receiverName': editAddress.address?.receiverName,
          'receiverMobileNumber': editAddress.address?.receiverMobileNumber,
        },
      };

      print('Request data: $data');

      var response = await _dio.put('/order/editAddress', data: data);

      if (response.statusCode == 200) {
        var responseData = response.data;
        return responseData;
      } else {
        return {
          'status': response.statusCode,
          'message': 'Unexpected error: ${response.statusMessage}',
        };
      }
    } on DioException catch (e) {
      return {
        'status': e.response?.statusCode ?? 500,
        'message': e.message,
      };
    } catch (e) {
      return {
        'status': 500,
        'message': 'An unexpected error occurred: ${e.toString()}',
      };
    }
  }

  //Place order api

  Future<dynamic> placeOrder(OrderRequest orderRequest) async {
    try {
      Map<String, dynamic> data = {
        'orderedBy': orderRequest.orderedBy,
        'customerId': orderRequest.customerId,
        'products': orderRequest.products,
        'deliveryAddress': orderRequest.deliveryAddress,
        'deliveryCharges': orderRequest.deliveryCharges,
        'grandTotal': orderRequest.grandTotal,
      };

      print('Request data: $data'); // Debugging print

      var response = await _dio.post('/order/create', data: data);

      if (response.statusCode == 200||response.statusCode == 201) {
        print('Response data: ${response.data}'); // Debugging print
        return {
          'status': 200,
          'data': response.data,
        };
      } else {
        print('Unexpected response: ${response.statusCode} - ${response.statusMessage}');
        return {
          'status': response.statusCode,
          'message': 'Unexpected error: ${response.statusMessage}',
        };
      }
    } on DioException catch (e) {
      print('DioException: ${e.response?.statusCode} - ${e.message}');
      return {
        'status': e.response?.statusCode,
        'message': e.message,
      };
    } catch (e) {
      print('Error in placeOrder API: $e');
      return {
        'status': 500,
        'message': 'An unexpected error occurred: ${e.toString()}',
      };
    }
  }

  //
  // Future<dynamic> placeOrder(OrderRequest orderRequest) async {
  //   // Ensure that tag is set
  //   try {
  //     Map<String, dynamic> data = {
  //       'orderedBy' : orderRequest.orderedBy,
  //       'customerId': orderRequest.customerId,
  //       'products': orderRequest.products,
  //       'deliveryAddress':  orderRequest.deliveryAddress,
  //       'deliveryCharges': orderRequest.deliveryCharges,
  //       'grandTotal': orderRequest.grandTotal
  //     };
  //
  //     print('Request data: $data'); // Debugging print
  //
  //     var response = await _dio.post('/order/create', data: data);
  //
  //     if (response.statusCode == 200) {
  //       var responseData = response.data;
  //       return responseData;
  //     } else {
  //       return {
  //         'status': response.statusCode,
  //         'message': 'Unexpected error: ${response.statusMessage}',
  //       };
  //     }
  //   } on DioException catch (e) {
  //     return {
  //       'status': e.response?.statusCode,
  //       'message': e.message,
  //     };
  //   } catch (e) {
  //     return {
  //       'status': 500,
  //       'message': 'An unexpected error occurred: ${e.toString()}',
  //     };
  //   }
  // }
}
