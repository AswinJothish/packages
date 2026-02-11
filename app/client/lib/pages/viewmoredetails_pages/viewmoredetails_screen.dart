import 'package:client/pages/viewmoredetails_pages/general_screen.dart';
import 'package:client/pages/viewmoredetails_pages/specification_screen.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../api_services/productdetail_api.dart';

class ViewmoredetailsScreen extends StatefulWidget {
  const ViewmoredetailsScreen({super.key});

  @override
  State<ViewmoredetailsScreen> createState() => _ViewmoredetailsScreenState();
}

class _ViewmoredetailsScreenState extends State<ViewmoredetailsScreen> {
  bool isLoading = true; // Add isLoading state
  var products;

  final ProductDetailService productDetails = ProductDetailService();


  @override
  void initState() {
    super.initState();
    // _fetchProductDetails();
    String productId = Get.arguments;
    getProductDetail(productId);
  }

  getProductDetail(String productId) async {
    final value = await productDetails.fetchProductById(productId);
    setState(() {
      products = value;
      isLoading = false;
      print('Single product details: $products');
    });
  }


  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2, // Number of tabs
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(70),
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
                      const SizedBox(height: 8,),
                      Text(
                        products.productName,
                       style:  GoogleFonts.roboto(
                          textStyle: const TextStyle(
                            fontSize: 15,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 5,),
                      Text(
                        "BRAND: ${products.brand}",
                        style:  GoogleFonts.roboto(
                          textStyle: const TextStyle(
                            fontSize: 12,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          Text(
                            "Rs.${products.customerPrice}",
                            style:  GoogleFonts.roboto(
                              textStyle: const TextStyle(
                                fontSize: 14,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          RichText(
                            text: TextSpan(
                              text: 'Inclusive GST: ',
                              style:  GoogleFonts.roboto(
                                textStyle: const TextStyle(
                                  fontSize: 12,
                                  color: Colors.white,
                                ),
                              ),
                              children: [
                                TextSpan(
                                  text: '₹${products.strikePrice}',
                                  style:  GoogleFonts.roboto(
                                    textStyle: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.white,
                                        decoration: TextDecoration
                                            .lineThrough,
                                    ),
                                  ),
                                  // style: TextStyle(
                                  //   fontFamily: 'Satoshi',
                                  //   fontSize: 12,
                                  //   fontWeight: FontWeight.w400,
                                  //   height: 18.9 / 14,
                                  //   color: Color(0xFFFFFFFF),
                                  //   decoration: TextDecoration
                                  //       .lineThrough, // Strikethrough text
                                  // ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
          ),
        ),
        body: isLoading
            ? const Center(
                child: CircularProgressIndicator()) // Show loading indicator
            : const Column(
                children: [
                  TabBar(
                    labelColor: Color(0xFF184282),
                    unselectedLabelColor: Color(0xFF757575),
                    indicatorColor: Color(0xFF184282),
                    dividerColor: Colors.transparent,
                    tabs: [
                      Tab(
                        child: Text(
                          'General',
                          style: TextStyle(
                            fontFamily: 'Satoshi', // Custom font family
                            fontSize: 18, // Font size
                            fontWeight: FontWeight.w700, // Font weight
                            height: 24.3 / 18, // Line height
                          ),
                        ),
                      ),
                      Tab(
                        child: Text(
                          'Specification',
                          style: TextStyle(
                            fontFamily: 'Satoshi', // Custom font family
                            fontSize: 18, // Font size
                            fontWeight: FontWeight.w700, // Font weight
                            height: 24.3 / 18, // Line height
                          ),
                        ),
                      ),
                    ],
                  ),
                  Expanded(
                    child: TabBarView(
                      children: [
                        GeneralScreen(),
                        SpecificationScreen(),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
