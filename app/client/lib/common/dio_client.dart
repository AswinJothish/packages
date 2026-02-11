import 'package:dio/dio.dart';


import '../contants/config.dart';
import '../contants/pref.dart';
import 'common.dart';

class ApiClient {
  static final Dio _dio = Dio();

  static Dio get dio => _dio;

  ApiClient._();

  static void initialize() async {
    _dio.options.baseUrl = AppConfig.apiUrl;

    // token = await SharedPrefsHelper.getString("token");

    // _dio.options.headers = {
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer $token',
    // };

    _dio.interceptors.add(LogInterceptor(responseBody: true));
  }

  static Future<void> updateToken(String newToken) async {
    token = newToken;
    await SharedPrefsHelper.setString("token", newToken);
    _dio.options.headers['Authorization'] = 'Bearer $newToken';
  }
}

//
// import 'package:dio/dio.dart';
//
// class ApiClient {
//   static final Dio dio = Dio(
//     BaseOptions(
//       baseUrl: 'http://192.168.1.39:4000/api/user', // Add your API base URL here
//       connectTimeout: const Duration(seconds: 15),
//       receiveTimeout: const Duration(seconds: 15),
//     ),
//   );
// }
