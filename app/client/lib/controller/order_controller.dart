import 'package:client/model/order_model.dart';
import 'package:get/get.dart';
import 'package:get/get_state_manager/src/simple/get_controllers.dart';

import '../api_services/yourcart_api.dart';
import '../common/common.dart';

class OrderController extends GetxController {
  var isLoading = true.obs;
  final YourcartApi orderapiservice = YourcartApi();

  @override
  void onInit() {
    super.onInit();
    fetchOrders();
  }

  Future<OrderModel?> fetchOrders() async {
    try {
      isLoading(true);
      OrderModel? response = await orderapiservice.getUserOrders(userId: id!);
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
