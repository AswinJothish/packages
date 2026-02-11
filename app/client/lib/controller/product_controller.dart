import 'package:get/get.dart';
import '../api_services/product_api.dart';
import '../model/product_model.dart';

class ProductController extends GetxController {
  var isLoading = true.obs;
  var products = <Products>[].obs;
  final ProductServices _productServices = ProductServices();

  @override
  void onInit() {
    super.onInit();
    fetchProducts();
  }

  void fetchProducts() async {
    try {
      isLoading(true);
      List<Products> productData = await _productServices.fetchAllProducts();
      products.assignAll(productData);
    } catch (e) {
      print("Error fetching products: $e");
    } finally {
      isLoading(false);
    }
  }
}
