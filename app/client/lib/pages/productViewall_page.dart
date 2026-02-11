import 'package:client/bottom_navigation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../api_services/product_api.dart';
import '../contants/pref.dart';
import '../controller/product_controller.dart';
import '../model/product_model.dart';
import 'productDetail_page.dart';

class ProductviewallPage extends StatefulWidget {
  final bool isAscending;

  const ProductviewallPage({super.key, required this.isAscending});

  @override
  State<ProductviewallPage> createState() => _ProductviewallPageState();
}

class _ProductviewallPageState extends State<ProductviewallPage> {
  final ProductController productController = Get.put(ProductController());
  final String _selectedOffer = "View Offer";
  final TextEditingController _searchController = TextEditingController();
  final ProductServices _productServices = ProductServices();
  List<Products> products = [];
  List<Products> filteredProducts = [];
  bool isLoading = false;
  String role = '';
  late double customerPrice;
  late double dealerPrice;
  bool isLoggedIn = true;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
    _filterProducts(_searchController.text);
  }

  Future<void> _fetchProducts() async {
    setState(() => isLoading = true);
    try {
      isLoggedIn = await SharedPrefsHelper.getBool('loggedIn');
      print("SharedPrefsHelper login value: $isLoggedIn");

      products = await _productServices.fetchAllProducts();

      // Sort products based on creation date
      products.sort((a, b) {
        DateTime dateA =
            DateTime.parse(a.createdAt ?? DateTime.now().toIso8601String());
        DateTime dateB =
            DateTime.parse(b.createdAt ?? DateTime.now().toIso8601String());
        return widget.isAscending
            ? dateA.compareTo(dateB)
            : dateB.compareTo(dateA);
      });

      _filterProducts(_searchController.text);
    } catch (e) {
      print('Error fetching products: $e');
      // Show error message to user
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Failed to load products. Please try again later.')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  void _filterProducts(String query) async {
    role = await SharedPrefsHelper.getString('role') ?? '';
    if (query.isNotEmpty) {
      String formattedQuery =
          query[0].toUpperCase() + query.substring(1).toLowerCase();

      setState(() {
        filteredProducts = products
            .where((product) =>
                product.productName != null &&
                product.productName!
                    .toLowerCase()
                    .contains(formattedQuery.toLowerCase()))
            .toList();
      });
    } else {
      setState(() {
        filteredProducts = products;
      });
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'No Products Found',
            style: GoogleFonts.roboto(
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Color(0xFF090F47),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const BottomNavigation()),
            );
          },
          icon: const Icon(Icons.arrow_back),
        ),
        title: Text(
          "Products",
          style: GoogleFonts.roboto(
            textStyle: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 18,
              color: Color(0xFF121212),
            ),
          ),
        ),
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : Column(
              children: [
                // Search Bar
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Container(
                    width: MediaQuery.of(context).size.width,
                    height: 55,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFEEEE),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: TextFormField(
                      controller: _searchController,
                      onChanged: (value) {
                        // _searchController(value);
                        _filterProducts(value);
                      },
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Search",
                        hintStyle: GoogleFonts.roboto(
                          textStyle: const TextStyle(
                            fontSize: 17,
                            color: Color(0xFF000000),
                          ),
                        ),
                        prefixIcon: Padding(
                          padding:
                              const EdgeInsets.only(left: 18.0, right: 18.0),
                          // Adjust padding for balance
                          child: Image.asset(
                            "assets/images/searchicon.png",
                            fit: BoxFit.contain,
                            width: 18,
                            height: 18,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            vertical: 15.0), // Center the text vertically
                      ),
                      style: const TextStyle(
                        fontSize: 17,
                        color: Colors.black,
                      ),
                    ),
                  ),
                ),
                // List of Products using ListView.builder
                Expanded(
                  child: isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : filteredProducts.isEmpty
                          ? _buildEmptyState()
                          : Obx(
                              () {
                                if (productController.isLoading.value) {
                                  return const Center(
                                      child: CircularProgressIndicator());
                                }
                                return ListView.builder(
                                  itemCount: filteredProducts.length,
                                  itemBuilder: (context, index) {
                                    final product = filteredProducts[index];
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16.0, vertical: 8.0),
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
                                          decoration: BoxDecoration(
                                            border: Border.all(
                                                color: const Color(0xFFECECEC),
                                                width: 2),
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          child: Column(
                                            children: [
                                              Row(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Padding(
                                                    padding:
                                                        const EdgeInsets.all(
                                                            8.0),
                                                    child: Container(
                                                      width: 107,
                                                      height: 130,
                                                      decoration: BoxDecoration(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(14),
                                                        color: const Color(
                                                            0xFFEBEAEA),
                                                        image: DecorationImage(
                                                          image: NetworkImage(
                                                              product.fullImageUrl),
                                                          // Use the image URL from the product model
                                                          fit: BoxFit.cover,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                  Expanded(
                                                    child: Padding(
                                                      padding:
                                                          const EdgeInsets.all(
                                                              8.0),
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Text(
                                                            product.productName ??
                                                                '',
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  const TextStyle(
                                                                fontSize: 18,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                color: Color(
                                                                    0xFF090F47),
                                                              ),
                                                            ),
                                                            maxLines: 1,
                                                            overflow:
                                                                TextOverflow
                                                                    .ellipsis,
                                                          ),
                                                          Text(
                                                            "BRAND : ${product.brand}",
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  const TextStyle(
                                                                fontSize: 14,
                                                                color: Color(
                                                                    0xFF4E505B),
                                                              ),
                                                            ),
                                                          ),
                                                          const SizedBox(
                                                              height: 10),
                                                          Text(
                                                            "Rs. ${isLoggedIn ? (role == 'dealer' ? product.dealerPrice : product.customerPrice) : product.customerPrice}",
                                                            // "\Rs.${product.customerPrice}",
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  const TextStyle(
                                                                fontSize: 20,
                                                                color: Color(
                                                                    0xFF090F47),
                                                              ),
                                                            ),
                                                          ),
                                                          const SizedBox(
                                                              height: 8),
                                                          RichText(
                                                            text: TextSpan(
                                                              text:
                                                                  'Inclusive GST: ',
                                                              style: GoogleFonts
                                                                  .roboto(
                                                                textStyle:
                                                                    const TextStyle(
                                                                  fontSize: 14,
                                                                  color: Color(
                                                                      0xFF0C6C03),
                                                                ),
                                                              ),
                                                              children: [
                                                                TextSpan(
                                                                  text:
                                                                      '₹${product.strikePrice}',
                                                                  style:
                                                                      GoogleFonts
                                                                          .roboto(
                                                                    textStyle:
                                                                        const TextStyle(
                                                                      fontSize:
                                                                          14,
                                                                      color: Color(
                                                                          0xFF757575),
                                                                      decoration:
                                                                          TextDecoration
                                                                              .lineThrough,
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              Container(
                                                width: double.infinity,
                                                height: 40,
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFEAE9E9)
                                                      .withOpacity(0.51),
                                                  borderRadius:
                                                      const BorderRadius.only(
                                                    bottomLeft:
                                                        Radius.circular(16),
                                                    bottomRight:
                                                        Radius.circular(16),
                                                  ),
                                                ),
                                                child: Row(
                                                  children: [
                                                    Padding(
                                                      padding:
                                                          const EdgeInsets.all(
                                                              8.0),
                                                      child: Container(
                                                        width: 22,
                                                        height: 22,
                                                        decoration:
                                                            const BoxDecoration(
                                                          gradient:
                                                              LinearGradient(
                                                            colors: [
                                                              Color(0xFF1FA56D),
                                                              Color(0xFF168469)
                                                            ],
                                                            begin: Alignment
                                                                .topLeft,
                                                            end: Alignment
                                                                .bottomRight,
                                                          ),
                                                          shape:
                                                              BoxShape.circle,
                                                        ),
                                                        child: const Icon(
                                                          Icons.percent,
                                                          color: Colors.white,
                                                          size: 15,
                                                        ),
                                                      ),
                                                    ),
                                                    RichText(
                                                      text: TextSpan(
                                                        text: 'Offer ',
                                                        style:
                                                            GoogleFonts.roboto(
                                                          textStyle:
                                                              const TextStyle(
                                                            fontSize: 14,
                                                            color: Color(
                                                                0xFF1F7B60),
                                                          ),
                                                        ),
                                                        children: [
                                                          TextSpan(
                                                            text:
                                                                "Rs. ${isLoggedIn ? (role == 'dealer' ? product.dealerPrice : product.customerPrice) : product.customerPrice}",

                                                            // '\Rs.${product.customerPrice}',
                                                            style: GoogleFonts
                                                                .roboto(
                                                              textStyle:
                                                                  const TextStyle(
                                                                fontSize: 14,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                color: Color(
                                                                    0xFF1F7B60),
                                                              ),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                    const Spacer(),
                                                    Padding(
                                                      padding:
                                                          const EdgeInsets.all(
                                                              8.0),
                                                      child:
                                                          _buildViewOfferButton(
                                                              product),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                );
                              },
                            ),
                ),
              ],
            ),
    );
  }

  Widget _buildViewOfferButton(product) {
    bool onClick = false;
    return InkWell(
      onTap: () {
        final RenderBox button = context.findRenderObject() as RenderBox;
        final Offset position = button.localToGlobal(Offset.zero);

        // Show popup menu at button's position
        showMenu(
          context: context,
          elevation: 0,
          color: Colors.transparent,
          position: RelativeRect.fromLTRB(
            position.dx + 100,
            position.dy + 400,
            position.dx + 50,
            position.dy + button.size.height + 10,
          ),
          items: [
            PopupMenuItem(
              enabled: false, // Disable the header item
              child: Container(
                decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.black38),
                    borderRadius: BorderRadius.circular(8)),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "Offer Prices",
                            style: TextStyle(
                              fontFamily: 'Satoshi',
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                            ),
                          ),
                          IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(Icons.close),
                          ),
                        ],
                      ),
                      Container(
                        constraints: const BoxConstraints(
                          maxHeight: 300,
                        ),
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (product.offers != null &&
                                  product.offers!.isNotEmpty)
                                ...product.offers!.map((offer) {
                                  return InkWell(
                                    onTap: () {
                                      setState(() {
                                        // _selectedOffer = "${offer.from} - ${offer.to}";
                                      });
                                      Navigator.pop(context);
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.only(bottom: 5),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 8,
                                        ),
                                        child: Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              "${offer.from} - ${offer.to} Quantity",
                                              style: const TextStyle(
                                                fontFamily: 'Satoshi',
                                                fontSize: 14,
                                                fontWeight: FontWeight.w500,
                                                color: Color(0xFF4E505B),
                                              ),
                                            ),
                                            const Spacer(),
                                            isLoggedIn
                                                ? Text(
                                                    "Rs.${role == 'dealer' ? offer.dealerPrice : role == 'customer' ? offer.customerPrice : ""} / 1",
                                                    style: const TextStyle(
                                                      fontFamily: 'Satoshi',
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.w700,
                                                      color: Color(0xFF090F47),
                                                    ),
                                                  )
                                                : Text(
                                                    "Rs. ${offer.customerPrice} / 1",
                                                    style: const TextStyle(
                                                      fontFamily: 'Satoshi',
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.w700,
                                                      color: Color(0xFF090F47),
                                                    ),
                                                  ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
      child: Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(13),
          shape: BoxShape.rectangle,
          border: Border.all(
            color: const Color(0xFF0C6C03),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              _selectedOffer.isNotEmpty ? _selectedOffer : "Select Offer",
              style: const TextStyle(color: Color(0xFF0C6C03)),
            ),
            const SizedBox(width: 5),
            Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF1FA56D), Color(0xFF168469)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: const Icon(
                Icons.keyboard_arrow_right,
                size: 15,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
