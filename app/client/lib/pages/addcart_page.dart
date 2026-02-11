import 'package:client/api_services/yourcart_api.dart';
import 'package:client/common/common.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import '../contants/pref.dart';
import '../controller/yourcartcontroller.dart';
import '../api_services/productdetail_api.dart';
import '../model/paymentsummaryrow.dart';
import '../model/productdetail_model.dart';
import '../model/yourcart_model/getcart_model.dart';
import 'checkout_page.dart';
import 'productViewall_page.dart';

class AddcartPage extends StatefulWidget {
  const AddcartPage({super.key});

  @override
  _AddcartPageState createState() => _AddcartPageState();
}

class _AddcartPageState extends State<AddcartPage> {
  bool isLoading = true;
  List<GetCart> cartitem = [];
  double totalPrice = 0.0;
  List<double> currentPrices = [];
  String role='';
  late double customerPrice;
  late double dealerPrice;

  TextEditingController quantitycontroller = TextEditingController();
  ProductDetails products = ProductDetails();

  final Yourcartcontroller controller = Get.put(Yourcartcontroller());

  List<TextEditingController> quantityControllers = [];

  final PagingController<int, GetCart> _pagingController =
      PagingController(firstPageKey: 1);

  void calculateTotalPrice() {
    double newTotal = 0.0;
    for (int i = 0; i < cartitem.length; i++) {
      if (currentPrices[i] > 0 && quantityControllers[i].text.isNotEmpty) {
        final quantity = int.tryParse(quantityControllers[i].text) ?? 0;
        newTotal += currentPrices[i] * quantity;
      }
    }
    setState(() {
      totalPrice = newTotal;
    });
  }
  @override
  void initState() {
    super.initState();
    _pagingController.addPageRequestListener((pageKey) {
      getCartItem(pageKey);
    });
  }


  Future<void> getCartItem(int page) async {
    try {
      role = await  SharedPrefsHelper.getString('role')??'';
      String? userId = await SharedPrefsHelper.getString('userId');
      GetCartItem? response = await controller.getCartItems(userId: userId ?? '');

      if (response != null) {
        final newItems = response.cart ?? [];
        const isLastPage = true;

        if (isLastPage) {
          _pagingController.appendLastPage(newItems);
        }

        setState(() {
          cartitem = newItems;
          quantityControllers.clear();
          currentPrices = List.filled(cartitem.length, 0.0);

          for (int i = 0; i < cartitem.length; i++) {
            var controller = TextEditingController(text: cartitem[i].quantity.toString());
            controller.addListener(() => updatePriceBasedOnQuantity(i));
            quantityControllers.add(controller);

            // Set initial price based on quantity
            updateInitialPrice(i, cartitem[i].quantity ?? 1);
          }

          calculateTotalPrice();
          isLoading = false;
        });
      } else {
        _pagingController.appendLastPage([]);
      }
    } catch (e) {
      _pagingController.error = e;
    }
  }

  void updateInitialPrice(int index, int quantity) {
    if (cartitem[index].productId?.offers == null) {
      // Set price based on role
      if (role == 'dealer') {
        currentPrices[index] = cartitem[index].productId?.dealerPrice?.toDouble() ?? 0.0;
      } else {
        currentPrices[index] = cartitem[index].productId?.customerPrice?.toDouble() ?? 0.0;
      }
      return;
    }

    var offers = cartitem[index].productId!.offers!;
    offers.sort((a, b) => (a.from as num).compareTo(b.from as num));

    var matchingOffer = offers.firstWhere(
          (offer) => quantity >= (offer.from as num) && quantity <= (offer.to as num),
      orElse: () {
        if (quantity > (offers.last.to as num)) return offers.last;
        return offers.first;
      },
    );

    // Set price based on role
    if (role == 'dealer') {
      currentPrices[index] = matchingOffer.dealerPrice?.toDouble() ?? 0.0;
      cartitem[index].productId?.dealerPrice = matchingOffer.dealerPrice;
    } else {
      currentPrices[index] = matchingOffer.customerPrice?.toDouble() ?? 0.0;
      cartitem[index].productId?.customerPrice = matchingOffer.customerPrice;
    }
  }



  void updatePriceBasedOnQuantity(int index) {
    if (quantityControllers[index].text.isEmpty ||
        cartitem[index].productId?.offers == null) {
      return;
    }

    try {
      int quantity = int.parse(quantityControllers[index].text);
      var offers = cartitem[index].productId!.offers!;

      offers.sort((a, b) => (a.from as num).compareTo(b.from as num));


      var matchingOffer = offers.firstWhere(
            (offer) => quantity >= (offer.from as num) && quantity <= (offer.to as num),
        orElse: () {if (quantity > (offers.last.to as num)) return offers.last;
    return offers.first;}
      );

      setState(() {
        if (role == 'dealer') {
          currentPrices[index] = matchingOffer.dealerPrice?.toDouble() ?? 0.0;
          cartitem[index].productId?.dealerPrice = matchingOffer.dealerPrice;
        } else {
          currentPrices[index] = matchingOffer.customerPrice?.toDouble() ?? 0.0;
          cartitem[index].productId?.customerPrice = matchingOffer.customerPrice;
        }
        calculateTotalPrice();
      });
    }  catch (e) {
      print('Error updating price: $e');
    }
  }


  @override
  void dispose() {
    // Dispose all controllers to prevent memory leaks
    for (var controller in quantityControllers) {
      controller.dispose();
    }
    super.dispose();
  }



  Widget _buildPaymentSummary() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Payment Summary",
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF090F47),
            ),
          ),
          const SizedBox(height: 8),
          PaymentSummaryRow(
            title: "Order Total",
            amount: totalPrice,
            amountColor: const Color(0xFF090F47),
            titleColor: const Color(0xFF0C6C03),
            isStrikethrough: false,
          ),
          const PaymentSummaryRow(
            title: "Delivery Charges",
            amount: 50,
            amountColor: Color(0xFF090F47),
            titleColor: Color(0xFF0C6C03),
            isStrikethrough: true,
            amountTitle: "Free Delivery",
          ),
          const Divider(),
          PaymentSummaryRow(
            title: "Total",
            amount: totalPrice,
            amountColor: Colors.black,
            titleColor: Colors.black,
            isStrikethrough: false,
          ),
          const SizedBox(height: 15),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Center(
              child: Container(
                width: 351,
                height: 60,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
                  ),
                  borderRadius: BorderRadius.circular(30.0),
                ),
                child: ElevatedButton(
                  onPressed: () async {
                    List<Map<String, dynamic>> productList = cartitem.map((item) {
                      return {
                        "productId": item.productId!.id??'',
                        "quantity": item.quantity,
                      };
                    }).toList();
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CheckoutPage(
                          count: cartitem.length.toString(),
                          totalAmount: totalPrice.toString(),
                          productList:productList ,
                        ),
                      ),
                    );
                  },

                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                  child: const Text(
                    'Proceed',
                    style: TextStyle(
                      color: Colors.white,
                      fontFamily: 'Satoshi',
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        return true;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F6F6),
        appBar: AppBar(
          backgroundColor: const Color(0xFFF7F6F6),
          title: const Text(
            "Your Cart",
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Colors.black,
            ),
          ),
          leading: IconButton(onPressed: () {
            Navigator.pop(context);
          }, icon: const Icon(Icons.arrow_back)),
        ),
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "${cartitem.length} items in your cart",
                    style: const TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF4E505B),
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ProductviewallPage(isAscending: true,),
                        ),(route) => false,
                      );
                    },
                    child: const Row(
                      children: [
                        Icon(Icons.add, color: Color(0xFF184282)),
                        SizedBox(width: 5),
                        Text(
                          "Add more",
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF184282),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            cartitem == null
                ? const SizedBox()
                : Expanded(
                    child: PagedListView(
                      pagingController: _pagingController,
                      physics: const BouncingScrollPhysics(),
                      builderDelegate: PagedChildBuilderDelegate(
                          animateTransitions: true,
                          noItemsFoundIndicatorBuilder: (context) {
                            return const Center(
                                child: Text("No Items in the cart"));
                          },
                          firstPageErrorIndicatorBuilder: (context) {
                            return const Center(
                                child: Text("Error loading data"));
                          },
                          itemBuilder: (context, item, index) {
                            var products = cartitem[index];
                            return Column(
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 73,
                                        height: 99,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(6),
                                          color: const Color(0xFFFFFFFF),
                                          image: DecorationImage(
                                            image: NetworkImage(products.productId!.fullImageUrl),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8), // Space between image and text
                                      Expanded(
                                        child: Padding(
                                          padding: const EdgeInsets.all(8.0),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                products.productId!.productName ?? '',
                                                style: GoogleFonts.roboto(
                                                  textStyle: const TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(0xFF090F47),
                                                  ),
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                                maxLines: 1,
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                "BRAND : ${products.productId!.brand}",
                                                style: GoogleFonts.roboto(
                                                  textStyle: const TextStyle(
                                                    fontSize: 12,
                                                    color: Color(0xFF4E505B),
                                                  ),
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                                maxLines: 1,
                                              ),
                                              const SizedBox(height: 4),
                                              RichText(
                                                text: TextSpan(
                                                  text: 'Inclusive GST: ',
                                                  style: GoogleFonts.roboto(
                                                    textStyle: const TextStyle(
                                                      fontSize: 12,
                                                      color: Color(0xFF0C6C03),
                                                    ),
                                                  ),
                                                  children: [
                                                    TextSpan(
                                                      text: '₹${products.productId!.strikePrice}',
                                                      style: GoogleFonts.roboto(
                                                        textStyle: const TextStyle(
                                                          fontSize: 12,
                                                          color: Color(0xFF757575),
                                                          decoration: TextDecoration.lineThrough,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                "Rs.${role == 'dealer' ? products.productId!.dealerPrice : role == 'customer' ? products.productId!.customerPrice : ""}",
                                                style: GoogleFonts.roboto(
                                                  textStyle: const TextStyle(
                                                    fontSize: 14,
                                                    color: Color(0xFF090F47),
                                                  ),
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                      Column(
                                        children: [
                                          GestureDetector(
                                            onTap: () {
                                              showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return AlertDialog(
                                                    shape: const RoundedRectangleBorder(
                                                      borderRadius: BorderRadius.all(Radius.circular(10.0)),
                                                    ),
                                                    title: const Column(
                                                      crossAxisAlignment: CrossAxisAlignment.center,
                                                      children: [
                                                        Text('Removing from Cart'),
                                                        SizedBox(height: 8),
                                                        Text(
                                                          'Do you want to remove this item?',
                                                          style: TextStyle(fontSize: 14),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ],
                                                    ),
                                                    actions: [
                                                      Center(
                                                        child: Column(
                                                          children: [
                                                            SizedBox(
                                                              width: double.infinity,
                                                              child: TextButton(
                                                                onPressed: () async {
                                                                  String? userId = await SharedPrefsHelper.getString('userId');
                                                                  final isDeleted = await controller.deleteCartItem(
                                                                    userId: userId ?? '',
                                                                    cartItemId: products.id ?? '',
                                                                  );
                                                                  if (isDeleted) {
                                                                    setState(() {
                                                                      cartitem.clear();
                                                                    });
                                                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                                                                        content: Text('Cart item deleted successfully')));
                                                                    _pagingController.refresh();
                                                                    Navigator.of(context).pop();
                                                                  }
                                                                },
                                                                child: const Text(
                                                                  'Remove',
                                                                  style: TextStyle(color: Colors.red, fontSize: 16),
                                                                ),
                                                              ),
                                                            ),
                                                            SizedBox(
                                                              width: double.infinity,
                                                              child: TextButton(
                                                                onPressed: () {
                                                                  Navigator.of(context).pop();
                                                                },
                                                                child: const Text(
                                                                  'Cancel',
                                                                  style: TextStyle(color: Colors.grey, fontSize: 16),
                                                                ),
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ],
                                                  );
                                                },
                                              );
                                            },
                                            child: Container(
                                              width: 18,
                                              height: 18,
                                              decoration: const BoxDecoration(
                                                image: DecorationImage(
                                                  image: AssetImage("assets/images/cartcloseicon.png"),
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(height: 30),
                                          Container(
                                            alignment: Alignment.center,
                                            height: 32,
                                            width: 87,
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFFFFFF),
                                              borderRadius: BorderRadius.circular(60),
                                              border: Border.all(color: const Color(0xff4e505b12)),
                                            ),
                                            child: TextFormField(
                                              controller: quantityControllers[index],
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
                                                isCollapsed: true,
                                                contentPadding: EdgeInsets.symmetric(vertical: 2),
                                                border: InputBorder.none,
                                              ),
                                              onChanged: (value) {
                                                if (value.isNotEmpty && !RegExp(r'^[1-9][0-9]*$').hasMatch(value)) {
                                                  quantityControllers[index].text = "1";
                                                  quantityControllers[index].selection = TextSelection.fromPosition(
                                                    TextPosition(offset: quantityControllers[index].text.length),
                                                  );
                                                } else {
                                                  if (value.isNotEmpty && RegExp(r'^[1-9][0-9]*$').hasMatch(value)) {
                                                    calculateTotalPrice();
                                                    updatePriceBasedOnQuantity(index);
                                                  }
                                                  if (value == "0") {
                                                    quantityControllers[index].text = "1";
                                                    quantityControllers[index].selection = TextSelection.fromPosition(
                                                      TextPosition(offset: quantityControllers[index].text.length),
                                                    );
                                                  }
                                                }
                                              },
                                              onFieldSubmitted: (value) {
                                                if (value == "0" || value.isEmpty) {
                                                  quantityControllers[index].text = "1";
                                                  quantityControllers[index].selection = TextSelection.fromPosition(
                                                    TextPosition(offset: quantityControllers[index].text.length),
                                                  );
                                                } else {
                                                  calculateTotalPrice();
                                                  updatePriceBasedOnQuantity(index);
                                                }
                                              },
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  )
      
                                ),
                                const Divider(), // Add Divider here
                              ],
                            );
                          }),
                    ),
                  ),
            if (cartitem.isNotEmpty) _buildPaymentSummary(),
          ],
        ),
      ),
    );
  }
}
