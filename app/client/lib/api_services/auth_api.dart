import 'dart:developer';

import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../common/dio_client.dart';
import '../pages/user.dart';


class AuthService {
  final Dio _dio = ApiClient.dio;

  Future<User> login(String phoneNumber) async {
    try {
      var response =
      await _dio.post("/auth/login", data: {"mobileNumber": phoneNumber});
      log("LOGIN RESPONSE:${response.data.toString()}");
      log("LOGIN RESPONSE CODE:${response.statusCode.toString()}");
      if (response.statusCode == 200 || response.statusCode == 201) {
        Fluttertoast.showToast(msg: "Login Successful");
        return User.fromJson(response.data);
      } else {
        Fluttertoast.showToast(msg: "Login Failed");
        throw Exception(response.data["message"]);
      }
    } catch (e) {
      rethrow;
    }
  }

  // Future<FCMToken> updateFcmToken(String token, phoneNumber) async {
  //   try {
  //     var response = await _dio.post("/auth/fcmtoken", data: {
  //       "token": token,
  //       "phoneNumber": phoneNumber,
  //     });
  //
  //     if (response.statusCode == 200) {
  //       return FCMToken.fromJson(response.data);
  //     } else {
  //       throw Exception(response.data["message"]);
  //     }
  //   } catch (e) {
  //     rethrow;
  //   }
  // }

  Future<bool> logout() async {
    return true;
  }
}
