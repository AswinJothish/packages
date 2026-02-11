import 'package:client/model/order_model.dart';
import 'package:get/get.dart';
import 'package:get/get_state_manager/src/simple/get_controllers.dart';

import '../api_services/yourcart_api.dart';
import '../common/common.dart';
import '../model/orderedit_model.dart';

class OrderEditController extends GetxController {
  var isLoading = true.obs;
  final YourcartApi ordereditapi = YourcartApi();

  @override
  void onInit() {
    super.onInit();
    fetchOrders();
  }

  Future<OrderEditModel?> fetchOrders() async {
    try {
      isLoading(true);
      OrderEditModel? response = await ordereditapi.getOrders(userId: id!);
      if (response != null) {
        return response;
      }
    } catch (e) {
      print("Error fetching orders: $e");
    } finally {
      isLoading(false);
    }
    return null;
  }
}
