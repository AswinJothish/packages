import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../api_services/product_api.dart';
import '../../contants/pref.dart';
import '../../controller/product_controller.dart';
import '../../model/categories_products_model.dart';
import '../addcart_page.dart';

class CategoryproductScreen extends StatefulWidget {
  final String categoryName;

  const CategoryproductScreen({super.key, required this.categoryName});

  @override
  State<CategoryproductScreen> createState() => _CategoryproductScreenState();
}

class _CategoryproductScreenState extends State<CategoryproductScreen> {
  final int _buttonIndex = 0;
  int sortbyradiobutton = 1;
  final ProductController productController = Get.put(ProductController());
  final TextEditingController _searchController = TextEditingController();
  bool isLoading = false;
  CategoryProductsModel? categoryProductsModel;
  List<String> categories = [];
  String selectedType = "";
  String role='';
  late double customerPrice;
  late double dealerPrice;
  bool isLoggedIn = false;

  final String _selectedOffer = "View Offer";

  @override
  void initState() {
    super.initState();
    // Initial fetch with default parameters
    fetchProductsCategory(
        widget.categoryName, selectedType, "", _searchController.text, "");
  }

  Future<void> fetchProductsCategory(String categoryName, String dateSort,
      String priceSort, String searchQuery, String? status) async {
    if (!isLoading) {
      setState(() {
        isLoading = true;
      });

      try {
        isLoggedIn = await SharedPrefsHelper.getBool('loggedIn');
        print("SharedPrefsHelper login value: $isLoggedIn");

        role = await  SharedPrefsHelper.getString('role')??'';
        var value = await ProductServices().fetchProductsByCategory(
          categoryName: categoryName,
          dateSort: dateSort,
          priceSort: priceSort,
          searchQuery: searchQuery,
        );

        setState(() {
          categoryProductsModel = CategoryProductsModel.fromJson(value);
        });
            } catch (e) {
        print('Error fetching products: $e');
        // Show error message to user
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load products. Please try again.')),
        );
      } finally {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Text(
              "Products",
              style: GoogleFonts.roboto(
                textStyle: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                  color: Color(0xFF121212),
                ),
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const AddcartPage()),
              ),
              child: Container(
                width: 39,
                height: 39,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.shopping_cart_outlined,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            )
          ],
        ),
      ),
      body:  RefreshIndicator(
        onRefresh: () async {
          setState(() {
            selectedType = '';
          });
          await fetchProductsCategory(
              widget.categoryName, selectedType, "", _searchController.text, "");
        },
        child: Column(
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFEEEE),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: TextFormField(
                  controller: _searchController,
                  onChanged: (value) {
                    // Implement search functionality
                    fetchProductsCategory(
                        widget.categoryName, selectedType, "", _searchController.text, "");
                  },
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: "Search",
                    hintStyle: GoogleFonts.roboto(
                      fontSize: 17,
                      color: Colors.black.withOpacity(0.5),
                    ),
                    prefixIcon: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Image.asset(
                        "assets/images/searchicon.png",
                        fit: BoxFit.contain,
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 11.0),
                  ),
                ),
              ),
            ),

            // Products count and sort
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Row(
                children: [
                  Text(
                    '${categoryProductsModel?.count ?? 0} Products results',
                    style: GoogleFonts.lato(
                      textStyle: const TextStyle(
                        fontWeight: FontWeight.w500,
                        fontSize: 13,
                        color: Color(0xFF121212),
                      ),
                    ),
                  ),
                  const Spacer(),
                  _buildSortButton(),
                ],
              ),
            ),

            // Product List
            Expanded(
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _buildProductList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductList() {
    if (categoryProductsModel?.data == null ||
        categoryProductsModel!.data!.isEmpty) {
      return const Center(
        child:  Text( 'No products found'),

      );
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      itemCount: categoryProductsModel!.data!.length,
      itemBuilder: (context, index) {
        final product = categoryProductsModel!.data![index];
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: GestureDetector(
            onTap: () {
              if (product.id != null) {
                Navigator.pushNamed(
                  context,
                  '/productdetailPage',
                  arguments: product.id,
                );
              }
            },
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFECECEC), width: 2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product Image
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Container(
                          width: 107,
                          height: 130,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(14),
                            color: const Color(0xFFEBEAEA),
                            image: DecorationImage(
                              image: NetworkImage(product.fullImageUrl ?? ''),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ),
                      // Product Details
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                product.productName ?? 'Unknown Product',
                                style: GoogleFonts.roboto(
                                  textStyle: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF090F47),
                                  ),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                "BRAND: ${product.brand ?? 'N/A'}",
                                style: GoogleFonts.roboto(
                                  textStyle: const TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF4E505B),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                "Rs. ${isLoggedIn ? (role == 'dealer' ? product.dealerPrice : product.customerPrice) : product.customerPrice}",
                                // "\Rs.${product.customerPrice}",
                                style: GoogleFonts.roboto(
                                  textStyle: const TextStyle(
                                    fontSize: 20,
                                    color: Color(0xFF090F47),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              RichText(
                                text: TextSpan(
                                  text: 'Inclusive GST: ',
                                  style: GoogleFonts.roboto(
                                    textStyle: const TextStyle(
                                      fontSize: 14,
                                      color: Color(0xFF0C6C03),
                                    ),
                                  ),
                                  children: [
                                    TextSpan(
                                      text: '₹${product.strikePrice}',
                                      style: GoogleFonts.roboto(
                                        textStyle: const TextStyle(
                                          fontSize: 14,
                                          color: Color(0xFF757575),
                                          decoration:
                                              TextDecoration.lineThrough,
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
                  _buildOfferSection(product),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildOfferSection(product) {
    return Container(
      width: double.infinity,
      height: 40,
      decoration: BoxDecoration(
        color: const Color(0xFFEAE9E9).withOpacity(0.51),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
      ),
      child: Row(
        children: [
          // Offer icon and text
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Container(
              width: 22,
              height: 22,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1FA56D), Color(0xFF168469)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.percent, color: Colors.white, size: 15),
            ),
          ),
          // Offer details
          Expanded(
            child: RichText(
              text: TextSpan(
                text: 'Offer ',
                style: GoogleFonts.roboto(
                  textStyle: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF1F7B60),
                  ),
                ),
                children: [
                  const TextSpan(
                    text: 'from ',
                    style: TextStyle(color: Color(0xFF090F47)),
                  ),
                  TextSpan(
                    text:
                    // "₹${role == 'dealer' ? product.dealerPrice :role == 'customer' ? product.customerPrice:""}",
                    // '₹${product.customerPrice?.toString() ?? '0'}',
                    "Rs. ${isLoggedIn ? (role == 'dealer' ? product.dealerPrice : product.customerPrice) : product.customerPrice}",

                    style: const TextStyle(color: Color(0xFF090F47)),
                  ),
                ],
              ),
            ),
          ),
          // View offer button
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: _buildViewOfferButton(product),
          ),
        ],
      ),
    );
  }

  // Widget _buildViewOfferButton(dynamic product) {
  //   const String VIEW_OFFER = 'View Offer';  // Constant for default value
  //
  //   return Container(
  //     padding: const EdgeInsets.all(3),
  //     decoration: BoxDecoration(
  //       borderRadius: BorderRadius.circular(13),
  //       border: Border.all(
  //         color: const Color(0xFF0C6C03),
  //       ),
  //     ),
  //     child: DropdownButtonHideUnderline(
  //       child: DropdownButton<String>(
  //         value: VIEW_OFFER,  // Always set to "View Offer"
  //         icon: Container(
  //           decoration: BoxDecoration(
  //             shape: BoxShape.circle,
  //             gradient: LinearGradient(
  //               colors: [Color(0xFF1FA56D), Color(0xFF168469)],
  //               begin: Alignment.topLeft,
  //               end: Alignment.bottomRight,
  //             ),
  //           ),
  //           child: Icon(
  //             Icons.keyboard_arrow_down,
  //             size: 15,
  //             color: Colors.white,
  //           ),
  //         ),
  //         items: [
  //           // Default "View Offer" item
  //           DropdownMenuItem<String>(
  //             value: VIEW_OFFER,
  //             child: Text(
  //               VIEW_OFFER,
  //               style: TextStyle(color: Color(0xFF0C6C03), fontSize: 14),
  //             ),
  //           ),
  //           // Offer items
  //           ...(product.offers ?? []).map<DropdownMenuItem<String>>((offer) {
  //             return DropdownMenuItem<String>(
  //               value: "${offer.from}-${offer.to}",
  //               child: SizedBox(
  //                 width: 150,
  //                 child: Padding(
  //                   padding: const EdgeInsets.symmetric(horizontal: 8.0),
  //                   child: Column(
  //                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
  //                     children: [
  //                       Expanded(
  //                         child: Text(
  //                           "${offer.from} - ${offer.to} Quantity",
  //                           style: TextStyle(
  //                             fontFamily: 'Satoshi',
  //                             fontSize: 14,
  //                             fontWeight: FontWeight.w500,
  //                             color: Color(0xFF4E505B),
  //                           ),
  //                           overflow: TextOverflow.ellipsis,
  //                         ),
  //                       ),
  //                       SizedBox(width: 8),
  //                       Text(
  //                         "Rs. ${offer.customerPrice} / 1",
  //                         style: TextStyle(
  //                           fontFamily: 'Satoshi',
  //                           fontSize: 14,
  //                           fontWeight: FontWeight.w700,
  //                           color: Color(0xFF090F47),
  //                         ),
  //                       ),
  //                     ],
  //                   ),
  //                 ),
  //               ),
  //             );
  //           }).toList(),
  //         ],
  //         onChanged: (String? newValue) {
  //           if (newValue != null && newValue != VIEW_OFFER) {
  //             // Split the value to get from and to quantities
  //             final parts = newValue.split('-');
  //             setState(() {
  //               _selectedOffer = "${parts[0]} - ${parts[1]}";
  //             });
  //           }
  //         },
  //         isExpanded: false,
  //         dropdownColor: Colors.white,
  //         borderRadius: BorderRadius.circular(8),
  //       ),
  //     ),
  //   );
  // }

  Widget _buildViewOfferButton(product) {
    bool onClick = false;
    return InkWell(
      onTap: () {
        final RenderBox button = context.findRenderObject() as RenderBox;
        final Offset position = button.localToGlobal(Offset.zero);

        // Show popup menu at button's position
        showMenu(
          context: context,elevation: 0,
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
                  borderRadius: BorderRadius.circular(8)
                ),
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
                              if (product.offers != null && product.offers!.isNotEmpty)
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
                                          crossAxisAlignment: CrossAxisAlignment.start,
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
                                            isLoggedIn ? Text(
                                              "Rs.${role == 'dealer' ? offer.dealerPrice :role == 'customer' ? offer.customerPrice:""} / 1",
                                              style: const TextStyle(
                                                fontFamily: 'Satoshi',
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                                color: Color(0xFF090F47),
                                              ),
                                            ) : Text(
                                              "Rs. ${offer.customerPrice} / 1",
                                              style: const TextStyle(
                                                fontFamily: 'Satoshi',
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
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

  Widget _buildSortButton() {
    return GestureDetector(
      onTap: () => _showFilterBottomSheet(),
      child: Row(
        children: [
          Text(
            "Sort by relevance",
            style: GoogleFonts.lato(
              textStyle: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: Color(0xFF4E505B),
              ),
            ),
          ),
          const SizedBox(width: 5),
          Image.asset("assets/images/sortbyicon.png", width: 18, height: 18),
        ],
      ),
    );
  }


  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      const Text(
                        "Sort By Relevance",
                        style: TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          color: Colors.black,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                  RadioListTile(
                    value: "highToLow",
                    groupValue: selectedType,
                    title: const Text(
                      'Price - High to Low',
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF4E505B),
                      ),
                    ),
                    onChanged: (value) {
                      setModalState(() {
                        selectedType = value.toString();
                      });
                      fetchProductsCategory(
                        widget.categoryName,
                        "",
                        "highToLow",
                        _searchController.text,
                        "",
                      ).then((_) {
                        Navigator.pop(context);
                      });
                    },
                  ),
                  RadioListTile(
                    value: "lowToHigh",
                    groupValue: selectedType,
                    title: const Text(
                      'Price - Low to High',
                      style: TextStyle(color: Colors.black),
                    ),
                    onChanged: (value) {
                      setModalState(() {
                        selectedType = value.toString();
                      });
                      fetchProductsCategory(
                        widget.categoryName,
                        "",
                        "lowToHigh",
                        _searchController.text,
                        "",
                      ).then((_) {
                        Navigator.pop(context);
                      });
                    },
                  ),
                  RadioListTile(
                    value: "newestFirst",
                    groupValue: selectedType,
                    title: const Text(
                      'Newest First',
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF4E505B),
                      ),
                    ),
                    onChanged: (value) {
                      setModalState(() {
                        selectedType = value.toString();
                      });
                      fetchProductsCategory(
                        widget.categoryName,
                        selectedType,
                        "",
                        _searchController.text,
                        "",
                      ).then((_) {
                        Navigator.pop(context);
                      });
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
