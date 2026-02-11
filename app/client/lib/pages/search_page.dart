import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:client/model/product_model.dart';
import 'package:shimmer/shimmer.dart';
import '../api_services/product_api.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage>
    with SingleTickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  final ProductServices _productServices = ProductServices();
  List<Products> products = [];
  List<Products> filteredProducts = [];
  List<Products> searchProducts = [];
  bool isLoading = false;

  // Rotation Controller
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fetchProducts();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _fetchProducts() async {
    setState(() => isLoading = true);
    try {
      products = await _productServices.fetchAllProducts();
      filteredProducts = products;
    } catch (e) {
      print('Error fetching products: $e');
    } finally {
      setState(() => isLoading = false);
    }
  }

  void _filterProducts(String query) {
    if (query.isNotEmpty) {
      String formattedQuery =
          query[0].toUpperCase() + query.substring(1).toLowerCase();

      setState(() {
        searchProducts = products
            .where((product) =>
                product.productName != null &&
                product.productName!
                    .toLowerCase()
                    .contains(formattedQuery.toLowerCase()))
            .toList();
      });
    } else {
      setState(() {
        searchProducts = [];
      });
    }
  }

  Widget _buildShimmerEffect() {
    return ListView.builder(
      itemCount: 10,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.all(8.0),
          child: Shimmer.fromColors(
            baseColor: Colors.grey[300]!,
            highlightColor: Colors.grey[100]!,
            child: Container(
              height: 48,
              width: 319,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFECECEC), width: 2),
              ),
              child: Row(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Container(
                      width: 25,
                      height: 32,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(4),
                        color: Colors.white,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      height: 15,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F6F6),
        elevation: 0,
        title: Container(
          margin: const EdgeInsets.only(top: 20, bottom: 20),
          width: double.infinity,
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color(0xFFEFEEEE),
            borderRadius: BorderRadius.circular(30),
          ),
          child: TextFormField(
            controller: _searchController,
            onChanged: _filterProducts,
            decoration: InputDecoration(
              border: InputBorder.none,
              hintText: "Search",
              hintStyle: TextStyle(
                fontSize: 17,
                color: Colors.black.withOpacity(0.5),
              ),
              prefixIcon: Padding(
                padding: const EdgeInsets.only(left: 13.0, right: 13.0),
                child: Image.asset(
                  "assets/images/searchicon.png",
                  width: 18,
                  height: 18,
                  fit: BoxFit.contain,
                ),
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 12.0),
            ),
            style: const TextStyle(
              fontSize: 17,
              color: Colors.black,
            ),
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          searchProducts.isNotEmpty
              ? Flexible(
                  child: Card(
                    elevation: 0,
                    color: const Color(0xFFF7F6F6),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(5.0),
                      child: ListView.builder(
                          itemCount: searchProducts.length,
                          itemBuilder: (context, index) {
                            return Column(
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    Navigator.pushNamed(
                                      context,
                                      '/productdetailPage',
                                      arguments: searchProducts[index].id, // Pass product data to the detail page
                                    );
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.only(
                                        left: 8, right: 8),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Flexible(
                                          child: Text(
                                            searchProducts[index].productName!,
                                            style: const TextStyle(
                                                overflow: TextOverflow.ellipsis,
                                                fontSize: 16,
                                                letterSpacing: 0.5,
                                                fontWeight: FontWeight.w600),
                                            maxLines: 1,
                                          ),
                                        ),
                                        CircleAvatar(
                                          radius: 18,
                                          backgroundColor:
                                              const Color(0xFFEBEAEA),
                                          child: Center(
                                            child: RotationTransition(
                                              turns:
                                                  Tween(begin: 0.10, end: 0.50)
                                                      .animate(_controller),
                                              child: const Icon(
                                                Icons.arrow_back,
                                                color: Colors.black,
                                                size: 20,
                                              ),
                                            ),
                                          ),
                                        )
                                      ],
                                    ),
                                  ),
                                ),
                                const Divider()
                              ],
                            );
                          }),
                    ),
                  ),
                )
              : Expanded(
                  child: isLoading
                      ? _buildShimmerEffect()
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text(
                                'Popular Products',
                                style: TextStyle(
                                    fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              child: ListView.builder(
                                itemCount: 5,
                                itemBuilder: (context, index) {
                                  final product = filteredProducts[index];
                                  return Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: GestureDetector(
                                      onTap: () {
                                        Navigator.pushNamed(
                                          context,
                                          '/productdetailPage',
                                          arguments: product
                                              .id, // Pass product data to the detail page
                                        );
                                      },
                                      child: Container(
                                        height: 53,
                                        width: 353,
                                        decoration: BoxDecoration(
                                            border: Border.all(
                                                color: const Color(0xFFECECEC),
                                                width: 2),
                                            borderRadius:
                                                BorderRadius.circular(12)),
                                        child: Row(
                                          children: [
                                            Padding(
                                              padding:
                                                  const EdgeInsets.all(8.0),
                                              child: Container(
                                                width: 25,
                                                height: 32,
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(4),
                                                  color:
                                                      const Color(0xFFEBEAEA),
                                                  image: DecorationImage(
                                                    image: NetworkImage(
                                                        product.fullImageUrl??''),
                                                    fit: BoxFit.cover,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              child: Text(
                                                product.productName ?? '',
                                                style: GoogleFonts.roboto(
                                                  textStyle: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w700,
                                                    color: Color(0xFF090F47),
                                                  ),
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                ),
        ],
      ),
    );
  }
}
