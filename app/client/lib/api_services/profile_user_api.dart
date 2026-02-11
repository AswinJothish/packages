import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../common/dio_client.dart';
import '../model/user_model.dart';

class UserApiService {
  final Dio _dio = ApiClient.dio;

  Future<UserProfile> getUserById(String id) async {
    try {
      final response = await _dio.get('/users/get', options: Options(
        headers: {'Cache-Control': 'no-cache', 'Pragma': 'no-cache'},
      ), queryParameters: {'id': id});

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['ok'] == true) {
          return UserProfile.fromJson(data);
        } else {
          throw Exception(data['message']);
        }
      } else if (response.statusCode == 400) {
        throw Exception('Bad request: ${response.data}');
      } else if (response.statusCode == 404) {
        throw Exception('User not found');
      } else {
        throw Exception('Failed to load user data');
      }
    } catch (error) {
      Fluttertoast.showToast(msg: "Something went wrong");
      rethrow;
    }
  }

  Future<dynamic> deleteUser(String userId) async {
    const String apiUrl = '/users/delete';

    try {
      final response = await _dio.delete(apiUrl, queryParameters: {'id': userId});

      if (response.statusCode == 200) {
      return response.data;
      } else {
        print(response.data['message'] ?? 'Failed to delete user');
      }
    } catch (error) {
      print('Error occurred: $error');
    }
  }
}