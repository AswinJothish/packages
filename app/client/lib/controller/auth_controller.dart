import '../api_services/auth_api.dart';
import '../pages/user.dart';

class AuthRepository {
  final AuthService _authService = AuthService();

  bool isLoading = false;

  Future<User> login(String phoneNumber) async {
    try {
      isLoading = true;
      var response = await _authService.login(phoneNumber);
      isLoading = true;
      return response;
    } catch (e) {
      rethrow;
    }
  }

  // Future<FCMToken> updateFcm(String token, phoneNumber) async {
  //   try {
  //     isLoading = true;
  //     var response = await _authService.updateFcmToken(token, phoneNumber);
  //     isLoading = false;
  //     return response;
  //   } catch (e) {
  //     rethrow;
  //   }
  // }

  Future<bool> logout() async {
    return await _authService.logout();
  }
}
