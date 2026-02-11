import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:path/path.dart'; // For using `basename` to get the file name
import '../common/dio_client.dart';

class Updateprofile {
  final Dio _dio = ApiClient.dio;

  Future<Object> UpdateUserProfile({
    required String userId,
    String? mobileNumber,
    String? profileImage,
    String? username,
  }) async {
    try {
      FormData formData = FormData.fromMap({
        'mobileNumber': mobileNumber ?? "",
        'username': username ?? "",
        if (profileImage != null)
          'profileImage': await MultipartFile.fromFile(
            profileImage,
            filename: basename(profileImage),
          ),
      });

      // Make the PUT request with formData
      final response = await _dio.put(
        '/users/update',
        queryParameters: {
          'id': userId,
        },
        data: formData,
        options: Options(
          headers: {'Content-Type': 'multipart/form-data'}, // Set content type
        ),
      );

      if (response.statusCode == 200) {
        return {
          'ok': true,
          'message': 'User updated successfully',
          'data': response.data,
        };
      } else {
        return {
          'ok': false,
          'message': response.data['message'] ?? 'Failed to update user',
        };
      }
    } catch (e) {
      return {
        'ok': false,
        'message': e.toString(),
      };
    }
  }
}
