import 'package:get/get.dart';
import '../model/productlistviewall_model.dart';

class ProductController extends GetxController {
  // List of products as observable variables
  var products = <ProductListViewall>[].obs;

  @override
  void onInit() {
    super.onInit();
    // Load initial product data
    loadProducts();
  }

  // Method to load products
  void loadProducts() {
    var productData = [
      ProductListViewall(
        id: "1",
        name: "Product 1",
        brand: "Brand A",
        amount: "500",
        inclusiveGst: "550",
        offerName: "Special Offer",
        viewOffer: "View Offer",
      ),
      ProductListViewall(
        id: "2",
        name: "Product 2",
        brand: "Brand B",
        amount: "800",
        inclusiveGst: "880",
        offerName: "Discount Offer",
        viewOffer: "View Offer",
      ),
      ProductListViewall(
        id: "3",
        name: "Product 3",
        brand: "Brand C",
        amount: "1200",
        inclusiveGst: "1320",
        offerName: "Limited Offer",
        viewOffer: "View Offer",
      ),

      ProductListViewall(
        id: "4",
        name: "Product 4",
        brand: "Brand C",
        amount: "1200",
        inclusiveGst: "1320",
        offerName: "Limited Offer",
        viewOffer: "View Offer",
      ),
    ];

    // Update the observable list of products
    products.assignAll(productData);
  }

  // Method for handling search functionality
  void searchProduct(String query) {
    if (query.isEmpty) {
      // Reset the list if the search query is empty
      loadProducts();
    } else {
      var filteredProducts = products.where((product) {
        return product.name.toLowerCase().contains(query.toLowerCase()) ||
            product.brand.toLowerCase().contains(query.toLowerCase());
      }).toList();

      products.assignAll(filteredProducts);
    }
  }
}
