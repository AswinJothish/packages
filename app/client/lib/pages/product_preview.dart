import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../api_services/productdetail_api.dart';

class ProductPreview extends StatefulWidget {
  const ProductPreview({super.key});

  @override
  State<ProductPreview> createState() => _ProductPreviewState();
}

class _ProductPreviewState extends State<ProductPreview> {
  // Variable to hold the path of the currently selected image
  String _selectedImage = ""; // Initially empty

  var products;

  bool isLoading = true;

  final ProductDetailService productDetails = ProductDetailService();

  Future<void> _fetchProducts() async {
    setState(() => isLoading = true);
    try {} catch (e) {
      print('Error fetching products: $e');
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    // _fetchProducts();
    String productId = Get.arguments;
    getProductDetail(productId);
  }

  getProductDetail(String productId) async {
    final value = await productDetails.fetchProductById(productId);
    setState(() {
      products = value;
      isLoading = false;

      // Set the first image as the default selected image
      if (products.fullImageUrl.isNotEmpty) {
        _selectedImage = products.fullImageUrl[0];
      }
      print('Single product details: $products');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(80),
        child: AppBar(
          iconTheme: const IconThemeData(color: Colors.white),
          backgroundColor: Colors.transparent,
          elevation: 0,
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
              ),
            ),
          ),
          title: isLoading
              ? Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(width: 150, height: 20, color: Colors.white),
                      const SizedBox(height: 5),
                      Container(width: 100, height: 15, color: Colors.white),
                      const SizedBox(height: 5),
                      Container(width: 80, height: 15, color: Colors.white),
                    ],
                  ),
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 5),
                    Text(
                      products.productName,
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      "BRAND: ${products.brand}",
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 12,
                          color: Colors.white,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          "Rs.${products.customerPrice}",
                          style: GoogleFonts.roboto(
                            textStyle: const TextStyle(
                              fontSize: 16,
                              color: Colors.white,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        RichText(
                          text: TextSpan(
                            text: 'Inclusive GST: ',
                            style: GoogleFonts.roboto(
                              textStyle: const TextStyle(
                                fontSize: 14,
                                color: Colors.white,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            children: [
                              TextSpan(
                                text: '₹${products.strikePrice}',
                                style: GoogleFonts.roboto(
                                  textStyle: const TextStyle(
                                    fontSize: 16,
                                    color: Colors.white,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  ],
                ),
        ),
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : Column(
              children: [
                Center(
                  child: SizedBox(
                    width: 361,
                    height: 456,
                    child: Image.network(_selectedImage),
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      products.fullImageUrl.length,
                      (index) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 5.0),
                        child: _buildThumbnail(products.fullImageUrl[index]),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  // Helper method to build thumbnail images with a border for the selected image
  Widget _buildThumbnail(String imageUrl) {
    bool isSelected = _selectedImage == imageUrl;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedImage = imageUrl;
        });
      },
      child: Container(
        width: 40,
        height: 50,
        decoration: BoxDecoration(
          border: isSelected
              ? Border.all(
                  color: Colors.black, width: 2) // Border for selected image
              : null,
          borderRadius: BorderRadius.circular(4),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: Image.network(imageUrl, fit: BoxFit.cover),
        ),
      ),
    );
  }
}
