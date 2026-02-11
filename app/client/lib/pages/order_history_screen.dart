import 'dart:developer';
import 'dart:io';

import 'package:client/contants/config.dart';
import 'package:client/controller/orderedit_controller.dart';
import 'package:client/model/orderedit_model.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:intl/intl.dart';

import '../api_services/yourcart_api.dart';
import 'package:path/path.dart';

import '../contants/pref.dart';
import '../model/paymentsummaryrow.dart';

class OrderHistoryScreen extends StatefulWidget {
  final String productId;

  const OrderHistoryScreen({super.key, 
    // Key? key,
    required this.productId,
  });

  @override
  _OrderHistoryScreenState createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  String role = '';
  late double customerPrice;
  late double dealerPrice;
  List<double> currentPrices = [];

  String formatOrderDate(String dateString) {
    DateTime dateTime = DateTime.parse(dateString);
    dateTime = dateTime.add(const Duration(hours: 5, minutes: 30));
    String dayMonth = DateFormat('d MMM yyyy').format(dateTime);
    return dayMonth;
  }

  String formatOrderTime(String dateString) {
    DateTime dateTime = DateTime.parse(dateString);
    dateTime = dateTime.add(const Duration(hours: 5, minutes: 30));
    String dayMonth = DateFormat('hh:mm a').format(dateTime);
    return dayMonth;
  }

  String transactionId = '';

  late final _transactionidController = TextEditingController();

  final YourcartApi yourcartApi = YourcartApi();

  bool isLoading = true;

  final OrderEditController orderEditController =
      Get.put(OrderEditController()); // Inject the controller
  OrderEditModel? orderEditModel = OrderEditModel();

  @override
  initState() {
    // TODO: implement initState
    super.initState();
    fetchData();
  }

  fetchData() async {
    try {
      role = await SharedPrefsHelper.getString('role') ?? '';
      var response =
          await yourcartApi.getOrders(userId: widget.productId ?? '');

      if (response != null) {
        setState(() {
          orderEditModel = response;
          if (orderEditModel?.order?.payment?.isNotEmpty == true) {
            final lastPayment = orderEditModel!.order!.payment!.last;
            _transactionidController.text = lastPayment.transactionId ?? '';
            _imageFile = lastPayment
                .paymentImage; // Ensure this is a full path if it's a file
          }
          isLoading = false;
        });

        calculateTotalPrice();
      }
    } catch (e) {
      print('Error fetching data: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  Widget _myStatusBadge(String mystatus) {
    Color badgeColor;
    String displayStatus;

    switch (mystatus.toLowerCase()) {
      case 'completed':
        badgeColor = const Color(0xFF19790A); // Green for "Completed"
        displayStatus = 'Completed';
        break;
      case 'pending':
        badgeColor = const Color(0xFFC87C10); // Amber for "In Progress"
        displayStatus = 'InProgress';
        break;
      case 'cancelled':
        badgeColor = Colors.red; // Red for "Cancelled"
        displayStatus = 'Cancelled';
        break;
      default:
        badgeColor = Colors.grey; // Grey for "Unknown" or other statuses
        displayStatus = 'Unknown';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 4),
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(30),
      ),
      child: Text(
        displayStatus,
        style: GoogleFonts.lato(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  String? _imageFile;

  Future<void> _pickPaymentImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: source,
      imageQuality: 100,
      maxHeight: 2000,
      maxWidth: 2000,
    );

    if (pickedFile != null) {
      setState(() {
        _imageFile = pickedFile.path;
      });
    } else {}
  }

  double totalPrice = 0.0;

  double calculatePriceForProduct(ProductIdmodel product, int quantity) {
    if (product.offers == null || product.offers!.isEmpty) {
      return role == 'dealer'
          ? (product.dealerPrice ?? 0).toDouble()
          : (product.customerPrice ?? 0).toDouble();
    }

    // Sort offers by 'from' value to ensure proper order
    product.offers!.sort((a, b) => (a.from ?? 0).compareTo(b.from ?? 0));

    // Find the applicable offer based on quantity
    Offers? applicableOffer = product.offers!.firstWhere(
      (offer) => quantity >= (offer.from ?? 0) && quantity <= (offer.to ?? 0),
      orElse: () {
        if (quantity > (product.offers!.last.to ?? 0)) {
          return product.offers!.last;
        }
        return product.offers!.first;
      },
    );

    return role == 'dealer'
        ? (applicableOffer.dealerPrice ?? product.dealerPrice ?? 0).toDouble()
        : (applicableOffer.customerPrice ?? product.customerPrice ?? 0)
            .toDouble();
  }

  void calculateTotalPrice() {
    double newTotal = 0.0;

    for (int i = 0; i < (orderEditModel?.order?.products?.length ?? 0); i++) {
      final product = orderEditModel!.order!.products![i];
      if (product.productId != null && product.quantity != null) {
        double productPrice = calculatePriceForProduct(
          product.productId!,
          product.quantity!,
        );
        newTotal += productPrice * product.quantity!;
      }
    }

    setState(() {
      totalPrice = newTotal;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: AppBar(
        title: const Text(
          "Order History",
          style: TextStyle(
            fontFamily: 'Satoshi',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            height: 24.3 / 18,
          ),
          textAlign: TextAlign.left,
        ),
        backgroundColor: const Color(0xFFF7F6F6),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildOrderInfo(orderEditModel!.order!),
                    const SizedBox(height: 16),
                    orderEditModel!.order!.products != null
                        ? Container(
                            constraints: const BoxConstraints(maxHeight: 350),
                            child: ListView.separated(
                              shrinkWrap: true,
                              physics: const BouncingScrollPhysics(),
                              itemCount:
                                  orderEditModel!.order!.products!.length,
                              itemBuilder: (context, index) {
                                return _buildProductInfo(
                                    orderEditModel!
                                        .order!.products![index].productId!,
                                    orderEditModel!.order!.products![index]);
                              },
                              separatorBuilder:
                                  (BuildContext context, int index) {
                                return const Divider();
                              },
                            ),
                          )
                        : const SizedBox(),
                    const SizedBox(height: 16),
                    _buildPaymentSummary(),
                    const SizedBox(height: 20),
                    _buildSaveChangesButton(context, orderEditModel!.order!),
                    const SizedBox(height: 20), // Bottom padding
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildOrderInfo(Order order) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          height: 42,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    order.orderId ?? '',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ),
                Text(
                  '${formatOrderDate(order.createdAt ?? '')} | ${formatOrderTime(order.createdAt ?? '')}',
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
                const SizedBox(width: 8),
                _myStatusBadge(order.status!),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        _buildUploadPaymentDetails(),
      ],
    );
  }

  Widget _buildUploadPaymentDetails() {
    bool isFullyPaid = false;
    if (orderEditModel?.order?.paymentDetails?.isNotEmpty == true) {
      final lastPayment = orderEditModel!.order!.paymentDetails!.last;
      isFullyPaid = lastPayment.balanceAmount == 0 || lastPayment.balanceAmount == null;
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        isFullyPaid ? const SizedBox():
        InkWell(
          onTap: () {
            _pickPaymentImage(ImageSource.gallery);
          },
          child: Container(
            width: double.infinity,
            height: 42,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.white,
            ),
            child: Center(
              child: _imageFile == null
                  ? Image.asset(
                      'assets/images/uploadpaymentfont.png',
                      width: 214,
                      height: 24,
                    )
                  : Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(
                        basename(_imageFile!),
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.black,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        isFullyPaid ? const SizedBox() :
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: Colors.white,
          ),
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Transaction ID",
                style: GoogleFonts.roboto(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                height: 42,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xff090f471a)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: TextFormField(
                  controller: _transactionidController,
                  keyboardType: TextInputType.text,
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Enter a Valid Transaction ID',
                    hintStyle: GoogleFonts.roboto(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onChanged: (value) {
                    setState(() {
                      transactionId = value;
                    });
                  },
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
       orderEditModel!.order!.paymentDetails==null||orderEditModel!.order!.paymentDetails!.isEmpty?const SizedBox():
        SizedBox(
            height: 225,
            child: ListView.builder(
              itemCount: orderEditModel?.order?.paymentDetails?.length ?? 0,
              scrollDirection: Axis.horizontal,
              itemBuilder: (context, index) {
                final paymentDetail =
                    orderEditModel?.order?.paymentDetails?[index];

                // Determine payment number label dynamically
                final paymentNumber = "Payment ${index + 1}";

                // Retrieve the paidAmount and balanceAmount and format them as integers
                final paidAmount = paymentDetail?.paidAmount?.toInt() ?? 0;
                final balanceAmount =
                    paymentDetail?.balanceAmount?.toInt() ?? 0;
                log("PaymentImage: ${AppConfig.imageUrl}${paymentDetail!.paymentImage}");

                return Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: Column(
                      children: [
                        SizedBox(
                          width: 317,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(paymentNumber),
                              // Display paidAmount and balanceAmount as integers
                              Text("Rs.$paidAmount / Rs.$balanceAmount"),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),

                        Container(
                          width: 317,
                          height: 130,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.black54),
                          ),
                          child: paymentDetail.paymentImage != null
                              ? Image.network(
                                  "${AppConfig.imageUrl}${paymentDetail.paymentImage!}",
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) =>
                                      const Center(
                                    child: Icon(Icons.error,
                                        size: 48, color: Colors.grey),
                                  ),
                                )
                              : const Center(
                                  child: Icon(Icons.image,
                                      size: 48, color: Colors.grey),
                                ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: 317,
                          height: 42,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.black26),
                            color: Colors.white,
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(paymentDetail.mode?.toLowerCase() == 'cash'
                                    ? 'Cash'
                                    : paymentDetail.transactionId ??
                                        'No transaction ID'),
                                Icon(
                                  paymentDetail.transactionId != null ||
                                          paymentDetail.mode?.toLowerCase() ==
                                              'cash'
                                      ? Icons.check_circle
                                      : Icons.pending,
                                  size: 18,
                                  color: (paymentDetail.transactionId != null ||
                                          paymentDetail.mode?.toLowerCase() ==
                                              'cash')
                                      ? const Color(0xFF168469)
                                      : Colors.grey,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            )),
      ],
    );
  }

  Widget _buildProductInfo(ProductIdmodel productDetails, ProductsQ products) {
    double currentPrice =
        calculatePriceForProduct(productDetails, products.quantity ?? 1);
    return Row(
      children: [
        Container(
          height: 103,
          width: 75,
          decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: Colors.white,
              image: DecorationImage(
                image: NetworkImage(productDetails.fullImageUrl),
              )),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 200,
              child: Text(
                productDetails.productName ?? '',
                style: const TextStyle(fontWeight: FontWeight.bold),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "BRAND : ${productDetails.brand}",
              style: GoogleFonts.roboto(
                textStyle: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF4E505B),
                ),
              ),
            ),
            const SizedBox(height: 4),
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
                        text: '₹${productDetails.strikePrice}',
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
              ],
            ),
            const SizedBox(height: 4),
            Text(
              // "Rs.${role == 'dealer' ? products.productId!.dealerPrice : role == 'customer' ?  products.productId!.customerPrice: ""}",

              "Rs.${currentPrice.toStringAsFixed(2)}",
              style: GoogleFonts.roboto(
                textStyle: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF090F47),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "Quantity - ${products.quantity}",
              style: GoogleFonts.roboto(
                textStyle: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF090F47),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPaymentSummary() {
    return Column(
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
        _buildSummaryRow(
            title: "Total",
            amount: 'Rs. ${totalPrice.toStringAsFixed(2)}',
            isBold: true,
            isStrikethrough: false,
            Strikethrough: ''),
        const SizedBox(
          height: 5,
        )
      ],
    );
  }

  Widget _buildSummaryRow(
      {required String title,
      required String amount,
      required String Strikethrough,
      bool isNegative = false,
      bool isBold = false,
      bool isStrikethrough = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween, // Adjusts spacing
        children: [
          Text(
            title,
            style: TextStyle(
              color: isNegative ? Colors.red : Colors.black,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            amount,
            style: TextStyle(
              color: isNegative ? Colors.red : Colors.black,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              decoration: isStrikethrough
                  ? TextDecoration.lineThrough
                  : TextDecoration.none,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSaveChangesButton(BuildContext context, Order order) {
    bool isFullyPaid = false;
    if (orderEditModel?.order?.paymentDetails?.isNotEmpty == true) {
      final lastPayment = orderEditModel!.order!.paymentDetails!.last;
      isFullyPaid = lastPayment.balanceAmount == 0 || lastPayment.balanceAmount == null;
    }

    return Center(
      child: Container(
        width: 351,
        height: 60,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isFullyPaid
                ? [Colors.grey[500]!, Colors.grey[500]!]
                : [const Color(0xFF1F5DA5), const Color(0xFF184282)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),

          borderRadius: BorderRadius.circular(30),
        ),
        child: ElevatedButton(
          onPressed: isFullyPaid
              ? null
              : () async {
            if (transactionId.isNotEmpty || _imageFile != null) {
              try {
                // Make API call with current values
                await yourcartApi.editOrder(
                  paymentImage: _imageFile,  // Send current image if any
                  transactionId: transactionId.isNotEmpty ? transactionId : null,
                  orderId: order.sId ?? '',
                );

                print("Transaction ID: $transactionId");

                // Clear both the image and transaction ID
                setState(() {
                  _imageFile = null;
                  transactionId = '';
                  _transactionidController.clear();
                });

                // Show success message
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Changes saved successfully!'),
                    backgroundColor: Colors.green,
                  ),
                );

                // Optionally, close the current screen after successful save
                Navigator.pop(context);

              } catch (e) {
                print('Error: $e');
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Failed to save changes. Please try again.'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            } else {
              Fluttertoast.showToast(
                msg: "Please enter a transaction ID or upload a payment details image.",
                toastLength: Toast.LENGTH_SHORT,
                gravity: ToastGravity.TOP,
                timeInSecForIosWeb: 1,
                backgroundColor: Colors.red,
                textColor: Colors.white,
                fontSize: 16.0,
              );
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30),
            ),
            elevation: 0,
            foregroundColor: Colors.white,
            disabledForegroundColor: Colors.white,
          ),
          child: Text(
            isFullyPaid ? "Payment Completed" : "Save Changes",
            style: const TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 24,
              fontWeight: FontWeight.bold,
              height: 32.43 / 24,
            ),
          ),
        )
      ),
    );
  }

}
