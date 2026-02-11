import 'package:get/get.dart';
import '../api_services/product_api.dart';
import '../model/product_model.dart';

// class HomePageController extends GetxController {
//   var isLoading = true.obs;
//   var products = <Products>[].obs;
//   var newProducts = <Products>[].obs;
//
//   final ProductServices _productServices = ProductServices();
//
//   @override
//   void onInit() {
//     super.onInit();
//     fetchProducts();
//   }
//
//   void fetchProducts() async {
//     try {
//       isLoading(true);
//       List<Products>? productData = await _productServices.fetchAllProducts(page: 1, limit: 10);
//         // Check if data was successfully retrieved
//         if (productData != null) {
//           products.assignAll(productData as Iterable<Products>);
//         } else {
//           Get.snackbar('No Products', 'No products found for this page');
//         }
//       }
//       catch (e) {
//       Fluttertoast.showToast(msg: "Error fetching products: $e");
//     } finally {
//       isLoading(false);
//     }
//   }
// }


// class HomePageController {
//   final ProductServices _addCategoryServices = ProductServices();
//
//   bool isLoading = false;
//
//   Future<List<Products>> getProductCategory() async {
//     try {
//       isLoading = true;
//       var response = await _addCategoryServices.fetchAllProducts();
//       isLoading = false;
//       return response;
//     } catch (e) {
//       rethrow;
//     }
//   }
// }


// class HomePageController {
//   final ProductServices _productServices = ProductServices();
//   bool isLoading = false;
//
//   Future<List<Products>> getProductCategory() async {
//     try {
//       isLoading = true;
//       var products = await _productServices.fetchAllProducts();
//       isLoading = false;
//       return products;
//     } catch (e) {
//       isLoading = false;
//       // Log the error or show a message
//       print("Error fetching products: $e");
//       rethrow;
//     }
//   }
// }


class HomePageController extends GetxController {
  var isLoading = true.obs;
  var products = <Products>[].obs;
  var newProducts = <Products>[].obs;

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
      products.assignAll(productData); // Update products list
      newProducts.assignAll(productData); // Update newProducts list (for demo purposes)
    } catch (e) {
      // Log or display error
      print("Error fetching products: $e");
    } finally {
      isLoading(false);
    }
  }
}

