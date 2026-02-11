import 'package:card_swiper/card_swiper.dart';
import 'package:client/controller/productdetail_controller.dart';
import 'package:client/pages/addcart_page.dart';
import 'package:client/pages/login_screen.dart';
import 'package:client/pages/product_preview.dart';
import 'package:client/pages/viewmoredetails_pages/viewmoredetails_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:shimmer/shimmer.dart';

import '../api_services/productdetail_api.dart';
import '../contants/pref.dart';
import '../controller/yourcartcontroller.dart';
import '../model/productdetail_model.dart';
import '../model/productdetailscart.dart';
import '../model/yourcart_model/getcart_model.dart';

class ProductdetailPage extends StatefulWidget {
  const ProductdetailPage({super.key, required product});

  @override
  State<ProductdetailPage> createState() => _ProductdetailPageState();
}

class _ProductdetailPageState extends State<ProductdetailPage> {
  final int _buttonIndex = 0;
  ProductDetails products = ProductDetails();
  bool _isExpanded = false;
  bool isLoading = true;
  double currentPrice = 0.0;
  String role='';
  late double customerPrice;
  late double dealerPrice;
  bool isLoggedIn = false;

  General general = General();

  final String _selectedOffer = "View Offer";

  final ProductDetailService productDetails = ProductDetailService();
  final Yourcartcontroller controller = Yourcartcontroller();
  TextEditingController quantitycontroller = TextEditingController();

  Future<void> _fetchProducts() async {
    setState(() => isLoading = true);
    isLoggedIn = await SharedPrefsHelper.getBool('loggedIn');
    print("SharedPrefsHelper login value: $isLoggedIn");
    try {} catch (e) {
      print('Error fetching products: $e');
    } finally {
      setState(() => isLoading = false);
    }
  }

  List<GetCart> cartitem = [];

  @override
  void initState() {
    super.initState();
    getCartItem();
    String productId = Get.arguments;
    getProductDetail(productId);
    quantitycontroller.text = '1';

    quantitycontroller.addListener(() {
      updatePriceBasedOnQuantity();
      validateQuantity();
    });
  }

  Future<void> getCartItem() async {
    try {
      role = await SharedPrefsHelper.getString('role') ?? '';
      String? userId = await SharedPrefsHelper.getString('userId');
      GetCartItem? response = await controller.getCartItems(userId: userId ?? '');
      print("response value for cart item");

      if (response != null) {
        setState(() {
          cartitem = response.cart ?? [];
          print("Data of cart item values: $cartitem");
        });
      } else {
        print("No items found in the cart.");
      }
    } catch (e) {
      print("Error fetching cart items: $e");
    }
  }

  @override
  void dispose() {
    quantitycontroller.removeListener(() {
      updatePriceBasedOnQuantity();
    });
    quantitycontroller.dispose();
    super.dispose();
  }

  void validateQuantity() {
    if (quantitycontroller.text.isEmpty) return;

    try {
      int quantity = int.parse(quantitycontroller.text);
      if (products.stock != null && quantity > products.stock!) {
        quantitycontroller.text = products.stock.toString();
        quantitycontroller.selection = TextSelection.fromPosition(
          TextPosition(offset: quantitycontroller.text.length),
        );

        Fluttertoast.showToast(
          msg: 'Maximum available stock is ${products.stock}',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0,
        );
      }
    } catch (e) {
      print('Error validating quantity: $e');
    }
  }

  void updatePriceBasedOnQuantity() {
    if (quantitycontroller.text.isEmpty || products.offers == null) return;

    try {
      int quantity = int.parse(quantitycontroller.text);

      var matchingOffer = products.offers!.firstWhere(
            (offer) => quantity >= (offer.from as num) && quantity <= (offer.to as num),
        orElse: () => products.offers!.last,
      );

      setState(() {
        // Update both dealer and customer prices
        if (role == 'dealer') {
          products.dealerPrice = matchingOffer.dealerPrice;
          currentPrice = matchingOffer.dealerPrice!.toDouble();
        } else {
          products.customerPrice = matchingOffer.customerPrice;
          currentPrice = matchingOffer.customerPrice!.toDouble();
        }
      });
    } catch (e) {
      print('Error updating price: $e');
    }
  }

  getProductDetail(String productId) async {
    role = await  SharedPrefsHelper.getString('role')??'';
    dynamic value = await productDetails.fetchProductById(productId);
    setState(() {
      products = value;
      general = products.general ?? General();
      // general =  products.general!;
      // general = (products.general as Map<String, dynamic>)
      //     .map((key, value) => MapEntry(key, value.toString()));
      if (products.offers != null && products.offers!.isNotEmpty) {
        currentPrice = products.offers![0].customerPrice!.toDouble();
        products.customerPrice = products.offers![0].customerPrice;
      }
      isLoading = false;
      print('Single products details: $products');
    });
  }

  addCart(String userId, int quantity) async {
    final isAdded = await controller.addToCart(
      userId: userId,
      productId: products.id ?? '',
      quantity: quantity,
    );

    if (isAdded) {
      // Navigate to the add cart page after successful addition
      Navigator.pushNamed(context, '/addcart').then((value) {
        setState(() {
          isLoading = true;
          cartitem.clear();
          Future.delayed(const Duration(seconds: 1), () {
            getCartItem();
            String productId = Get.arguments;
            getProductDetail(productId);
            quantitycontroller.text = '1';

            quantitycontroller.addListener(() {
              updatePriceBasedOnQuantity();
              validateQuantity();
            });
          });
        });
      });
      Fluttertoast.showToast(
        msg: 'Product added to cart',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.green,
        textColor: Colors.white,
        fontSize: 16.0,
      );
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
              onTap: () {
                // Get.toNamed('/checkout');
                Navigator.push(context,
                    MaterialPageRoute(builder: (context) => const AddcartPage()));
              },
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
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF121212)),
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(15.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Title and Brand
                    Text(
                      products.productName ?? '',
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: Colors.black,
                        ),
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      "BRAND : ${products.brand}",
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Product Image
                    GestureDetector(
                      onTap: () {
                        Get.to(() => const ProductPreview(), arguments: products.id);
                      },
                      child: Center(
                          child: SizedBox(
                              height: 282,
                              width: 221,
                              child: Swiper(
                                itemBuilder: (BuildContext context, int index) {
                                  return Image.network(
                                    products.fullImageUrl[index],
                                  );
                                },
                                itemCount: products.fullImageUrl.length,
                                autoplay: true,
                                pagination: const SwiperPagination(
                                  builder: DotSwiperPaginationBuilder(
                                    activeColor:
                                        Colors.blue, // Color for active dot
                                    color: Colors.grey,
                                    activeSize: 10.0,
                                  ),
                                ),
                                control: null,
                              ))),
                    ),
                    const SizedBox(height: 20),
                    // Price with strikethrough effect and GST details
                    Row(
                      children: [
                        RichText(
                          text: TextSpan(
                            text: 'Inclusive GST: ',
                            // Normal text
                            style: GoogleFonts.roboto(
                              textStyle: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF0C6C03),
                              ),
                            ),
                            children: [
                              TextSpan(
                                text: '₹${products.strikePrice}',
                                // Strikethrough text
                                style: GoogleFonts.roboto(
                                  textStyle: const TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF757575),
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Spacer(),
                        Card(
                          child: Container(
                            alignment: Alignment.center,
                            height: 32,
                            width: 87,
                            child: Center(
                              child: TextFormField(
                                controller: quantitycontroller,
                                keyboardType: TextInputType.number,
                                cursorHeight: 20,
                                style: GoogleFonts.overpass(
                                  textStyle: const TextStyle(
                                    fontSize: 16,
                                    color: Color(0xFF000000),
                                  ),
                                ),
                                textAlign: TextAlign.center,
                                decoration: const InputDecoration(
                                  contentPadding: EdgeInsets.symmetric(vertical: 2),
                                  isCollapsed: true,
                                  border: InputBorder.none, // Removes the TextFormField's border
                                ),
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly, // Only allow numeric input
                                ],
                                onChanged: (value) {
                                  if (value == "0") {
                                    quantitycontroller.text = "1";
                                    quantitycontroller.selection = TextSelection.fromPosition(
                                      TextPosition(offset: quantitycontroller.text.length),
                                    );
                                  }
                                  validateQuantity();
                                },
                                onFieldSubmitted: (value) {
                                  if (value == "0" || value.isEmpty) {
                                    quantitycontroller.text = "1";
                                    quantitycontroller.selection = TextSelection.fromPosition(
                                      TextPosition(offset: quantitycontroller.text.length),
                                    );
                                  }
                                },
                              ),

                            ),
                          ),
                        )
                      ],
                    ),
                    Text(
                      "Rs.${role == 'dealer' ? products.dealerPrice :role == 'customer' ? products.customerPrice: !isLoggedIn ? products.customerPrice:""}",
                      // "Rs.${role == 'dealer' ? products.dealerPrice :role == 'customer' ? products.customerPrice: !isLoggedIn ? products.customerPrice:""}",
                      // "\Rs.${currentPrice.toInt()}",
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Quantity Selector
                    // Row(
                    //   children: [
                    //     InkWell(
                    //       onTap: () {
                    //         setState(() {
                    //           _buttonIndex = 0;
                    //         });
                    //       },
                    //       child: Container(
                    //         width: 170,
                    //         height: 39,
                    //         decoration: BoxDecoration(
                    //             gradient: _buttonIndex == 0
                    //                 ? LinearGradient(colors: [
                    //                     Color(0xFF1F5DA5),
                    //                     Color(0xFF184282)
                    //                   ])
                    //                 : null,
                    //             color: _buttonIndex == 0
                    //                 ? null
                    //                 : Color(0xFFFFFFFF),
                    //             borderRadius: BorderRadius.circular(10),
                    //             border: Border.all(color: Color(0xFFC6C6C6))),
                    //         child: Center(
                    //           child: Text(
                    //             "Electric Purifier",
                    //             style: GoogleFonts.manrope(
                    //               textStyle: TextStyle(
                    //                 fontWeight: FontWeight.w600,
                    //                 fontSize: 14,
                    //                 color: _buttonIndex == 0
                    //                     ? Colors.white
                    //                     : Color(0xFF121212),
                    //               ),
                    //             ),
                    //           ),
                    //         ),
                    //       ),
                    //     ),
                    //     SizedBox(
                    //       width: 5,
                    //     ),
                    //     InkWell(
                    //       onTap: () {
                    //         setState(() {
                    //           _buttonIndex = 1;
                    //         });
                    //       },
                    //       child: Container(
                    //         width: 175,
                    //         height: 39,
                    //         decoration: BoxDecoration(
                    //             gradient: _buttonIndex == 1
                    //                 ? LinearGradient(colors: [
                    //                     Color(0xFF1F5DA5),
                    //                     Color(0xFF184282)
                    //                   ])
                    //                 : null,
                    //             color: _buttonIndex == 1
                    //                 ? null
                    //                 : Color(0xFFFFFFFF),
                    //             borderRadius: BorderRadius.circular(10),
                    //             border: Border.all(color: Color(0xFFC6C6C6))),
                    //         child: Center(
                    //           child: Text(
                    //             "Non - Electric Purifier",
                    //             style: GoogleFonts.manrope(
                    //               textStyle: TextStyle(
                    //                 fontWeight: FontWeight.w600,
                    //                 fontSize: 14,
                    //                 color: _buttonIndex == 1
                    //                     ? Colors.white
                    //                     : Color(0xFF121212),
                    //               ),
                    //             ),
                    //           ),
                    //         ),
                    //       ),
                    //     ),
                    //   ],
                    // ),
                    const SizedBox(height: 20),

                    // Offer Section
                    Container(
                      color: const Color(0xFFFBFAFA),
                      padding: const EdgeInsets.symmetric(horizontal: 8.0), // Add padding for spacing
                      child: Row(
                        children: [
                          Container(
                            width: 22,
                            height: 22,
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Color(0xFF1FA56D),
                                  Color(0xFF168469)
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.percent,
                              color: Colors.white,
                              size: 15,
                            ),
                          ),
                          const SizedBox(width: 8), // Space between icon and text
                          Expanded( // Allows text to take up remaining space
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
                                  TextSpan(
                                    text: 'price starts from ',
                                    style: GoogleFonts.roboto(
                                      textStyle: const TextStyle(
                                        fontSize: 14,
                                        color: Color(0xFF090F47),
                                      ),
                                    ),
                                  ),
                                  TextSpan(
                                    text: "Rs.${role == 'dealer' ? products.dealerPrice : role == 'customer' ? products.customerPrice : !isLoggedIn ? products.customerPrice : ""}",
                                    style: GoogleFonts.roboto(
                                      textStyle: const TextStyle(
                                        fontSize: 14,
                                        color: Color(0xFF090F47),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8), // Space between text and button
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: _buildViewOfferButton(products),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Description
                    Text(
                      "Description",
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final textSpan = TextSpan(
                          text: products.description ?? '',
                          style: GoogleFonts.roboto(
                            textStyle: const TextStyle(
                              fontSize: 14,
                              color: Colors.black54,
                            ),
                          ),
                        );

                        final textPainter = TextPainter(
                          text: textSpan,
                          maxLines: 4,
                          textDirection: TextDirection.ltr,
                        );

                        textPainter.layout(maxWidth: constraints.maxWidth);

                        // Show the "View More" button if the text exceeds 4 lines
                        bool showViewMoreButton = textPainter.didExceedMaxLines;

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              products.description ?? '',
                              maxLines: _isExpanded ? null : 4,
                              overflow: _isExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                              style: GoogleFonts.roboto(
                                textStyle: const TextStyle(
                                  fontSize: 14,
                                  color: Colors.black54,
                                ),
                              ),
                            ),
                            if (showViewMoreButton) // Only show if the text exceeds 4 lines
                              GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _isExpanded = !_isExpanded;
                                  });
                                },
                                child: Text(
                                  _isExpanded ? 'View Less' : 'View More',
                                  style: const TextStyle(
                                    color: Colors.black,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        );
                      },
                    ),
                    // Dropdown arrow for expanding/collapsing the text
                    const SizedBox(height: 20),

                    // General Information Section
                    Text(
                      "General",
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: 2,
                      itemBuilder: (context, index) {
                        Map<String, String?> generalData = {
                          "Color": general.color,
                          "Material": general.material,
                        };

                        String key = generalData.keys.elementAt(index);
                        String value = generalData[key] ?? "N/A"; // Handle null values

                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4.0),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 150,
                                child: Text(
                                  key, // Display the key.
                                  style: GoogleFonts.roboto(
                                    textStyle: const TextStyle(
                                      fontSize: 16,
                                      color: Colors.black54,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 150,
                                child: Align(
                                  alignment: Alignment.centerRight, // Center the value within the available space.
                                  child: Text(
                                    value, // Display the value.
                                    style: GoogleFonts.roboto(
                                      textStyle: const TextStyle(
                                        fontSize: 16,
                                        color: Color(0xFF090F47),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 20),
                    InkWell(
                      onTap: () {
                        Get.to(() => const ViewmoredetailsScreen(),
                            arguments: products.id);
                      },
                      child: Container(
                        height: 38,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFC6C6C6)),
                          color: const Color(0xFFF8F8F8),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                child: ShaderMask(
                                  shaderCallback: (bounds) => const LinearGradient(
                                    colors: [
                                      Color(0xFF1F5DA5),
                                      Color(0xFF184282)
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ).createShader(bounds),
                                  child: const Text(
                                    "View more details",
                                    style: TextStyle(
                                      fontFamily: 'Satoshi',
                                      // Specify the custom font family
                                      fontSize: 16,
                                      // Font size in pixels
                                      fontWeight: FontWeight.bold,
                                      // Font weight for bold text
                                      height: 21.62 / 16,
                                      // Line height as a multiplier
                                      color: Colors
                                          .white, // This color is not used; gradient will be applied
                                    ),
                                  ),
                                ),
                              ),
                              Container(
                                width: 20,
                                height: 20,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    colors: [
                                      Color(0xFF1F5DA5),
                                      Color(0xFF184282)
                                    ],
                                    // Gradient colors
                                    begin: Alignment.topLeft,
                                    // Gradient start point
                                    end: Alignment
                                        .bottomRight, // Gradient end point
                                  ),
                                ),
                                child: const Icon(
                                  Icons.keyboard_arrow_right,
                                  size: 15,
                                  color: Colors.white,
                                ),
                              )
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                    // Add to Cart Button
                    Container(
                        width: double.infinity,
                        height: 60,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(
                              30), // Optional: for rounded corners
                        ),
                        child: ElevatedButton(
                          onPressed: () async {
                            print("Add to cart function is calling");
                            // Check if the quantity is empty or invalid
                            if (products.stock == null || products.stock! <= 0) {
                              Fluttertoast.showToast(
                                msg: 'Product is out of stock',
                                toastLength: Toast.LENGTH_SHORT,
                                gravity: ToastGravity.BOTTOM,
                                backgroundColor: Colors.red,
                                textColor: Colors.white,
                                fontSize: 16.0,
                              );
                              return;
                            }

                            // Check quantity validity
                            if (quantitycontroller.text.isEmpty ||
                                int.tryParse(quantitycontroller.text) == null ||
                                int.parse(quantitycontroller.text) <= 0) {
                              Fluttertoast.showToast(
                                msg: 'Please enter a valid quantity',
                                toastLength: Toast.LENGTH_SHORT,
                                gravity: ToastGravity.BOTTOM,
                                backgroundColor: Colors.red,
                                textColor: Colors.white,
                                fontSize: 16.0,
                              );
                              return;
                            }

                            int quantity = int.parse(quantitycontroller.text);

                            // Check if quantity exceeds available stock
                            if (quantity > products.stock!) {
                              Fluttertoast.showToast(
                                msg: 'Quantity exceeds available stock (${products.stock})',
                                toastLength: Toast.LENGTH_SHORT,
                                gravity: ToastGravity.BOTTOM,
                                backgroundColor: Colors.red,
                                textColor: Colors.white,
                                fontSize: 16.0,
                              );
                              return;
                            }
                            String? userId = await SharedPrefsHelper.getString('userId');
                            if (userId == null) {
                              Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const LoginScreen()));
                            } else {
                              bool itemAdded = false;

                              if (cartitem.isNotEmpty) {
                                for (int i = 0; i < cartitem.length; i++) {
                                  if (cartitem[i].productId!.id == products.id) {
                                    int availableStock = cartitem[i].productId!.stock!;
                                    int currentQuantity = cartitem[i].quantity!;

                                    if (currentQuantity + quantity > availableStock) {
                                      Fluttertoast.showToast(
                                        msg: 'Only $availableStock units can be added to cart',
                                        toastLength: Toast.LENGTH_SHORT,
                                        gravity: ToastGravity.BOTTOM,
                                        backgroundColor: Colors.red,
                                        textColor: Colors.white,
                                        fontSize: 16.0,
                                      );
                                      itemAdded = true;
                                      break;
                                    } else {
                                      addCart(userId, quantity);
                                      itemAdded = true;
                                      break;
                                    }
                                  }
                                }

                                if (!itemAdded) {
                                  addCart(userId, quantity);
                                }
                              } else {
                                addCart(userId, quantity);
                              }
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: EdgeInsets.zero,
                          ),
                          child: const Text(
                            "Add to Cart",
                            style: TextStyle(
                              fontFamily: 'Satoshi',
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              height: 32.43 / 24,
                              color: Colors.white, // Text color
                            ),
                          ),
                        )
                    )
                  ],
                ),
              ),
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
                width: 300,
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
                                          Text(
                                            "Rs.${role == 'dealer' ? offer.dealerPrice :role == 'customer' ? offer.customerPrice:""} / 1",
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
        padding: const EdgeInsets.all(2),
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
