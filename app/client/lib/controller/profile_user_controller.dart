import 'package:client/model/user_model.dart';
import 'package:get/get.dart';
import '../api_services/profile_user_api.dart';
import '../common/common.dart';

class ProfileUserController extends GetxController {
  var isLoading = true.obs;
  // var profileuser = <UserModel>[].obs;
  final UserApiService _userApiService = UserApiService();

  @override
  void onInit() {
    super.onInit();
    fetchProducts();
  }

  void fetchProducts() async {
    try {
      isLoading(true);
      List<UserModel> userData = (await _userApiService.getUserById(id!)) as List<UserModel>;
      // profileuser.assignAll(userData);
    } catch (e) {
      print("Error fetching products: $e");
    } finally {
      isLoading(false);
    }
  }
}
