import 'package:client/api_services/yourcart_api.dart';
import 'package:client/bottom_navigation.dart';
import 'package:client/pages/order_history_screen.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../contants/pref.dart';
import '../controller/order_controller.dart';
import '../model/order_model.dart';
import 'home_page.dart';

class OrderPage extends StatefulWidget {
  const OrderPage({super.key});

  @override
  State<OrderPage> createState() => _OrderPageState();
}

class _OrderPageState extends State<OrderPage> {


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

  int filterRadioButton = 0;

  bool isLoading = true;

  String selectedType = "";
  String selectedTime = "";

  final YourcartApi yourcartApi = YourcartApi();

  final OrderController orderController =
      Get.put(OrderController()); // Inject the controller
  OrderModel? orderModel = OrderModel();

  @override
  initState() {
    // TODO: implement initState
    super.initState();
    fetchData();
  }

  fetchData() async {
    String? userId = await SharedPrefsHelper.getString('userId');
    setState(() {
      isLoading = true;
    });
    var response = await yourcartApi.getUserOrders(
      userId: userId ?? '',
      status: selectedType,
      timeFilter: selectedTime,
    );

    setState(() {
      isLoading = false;
      orderModel = response;
    });
  }


  Widget _buildEmptyState() {
    return RefreshIndicator(
      onRefresh: () async {
        setState(() {
          selectedType = '';
          selectedTime = '';
        });
        await fetchData();
      },
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.remove_shopping_cart_outlined,
              size: 50,
            ),
            const SizedBox(height: 16),
            Text(
              "No Orders Yet",
              style: GoogleFonts.roboto(
                textStyle: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF121212),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Looks like you haven't made any orders yet",
              style: GoogleFonts.roboto(
                textStyle: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF666666),
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Uncomment the ElevatedButton below to allow users to start shopping
            // ElevatedButton(
            //   onPressed: () {
            //     Navigator.pop(context);
            //   },
            //   style: ElevatedButton.styleFrom(
            //     backgroundColor: const Color(0xFF184282),
            //     padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            //     shape: RoundedRectangleBorder(
            //       borderRadius: BorderRadius.circular(8),
            //     ),
            //   ),
            //   child: Text(
            //     "Start Shopping",
            //     style: GoogleFonts.roboto(
            //       textStyle: const TextStyle(
            //         fontSize: 16,
            //         fontWeight: FontWeight.w500,
            //         color: Colors.white,
            //       ),
            //     ),
            //   ),
            // ),
          ],
        ),
      ),
    );
  }


  DateTime? _lastPressedAt;

  Future<bool> _onWillPop() async {
    if (_lastPressedAt == null ||
        DateTime.now().difference(_lastPressedAt!) > const Duration(seconds: 2)) {
      _lastPressedAt = DateTime.now();

      // Instead of showing dialog, navigate to homepage
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (context) => const BottomNavigation(), // Replace with your HomePage widget
        ),
            (route) => false, // This removes all previous routes from the stack
      );

      return false; // Prevents the app from exiting
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F6F6),
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: Row(
            children: [
              Text(
                "Order History",
                style: GoogleFonts.roboto(
                  textStyle: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                    color: Color(0xFF121212),
                  ),
                ),
              ),
              const Spacer(),
              IconButton(
                onPressed: () {
                  _showFilterBottomSheet();
                },
                icon: SizedBox(
                  width: 28,
                  height: 16,
                  child: Image.asset(
                    "assets/images/filttericon.png",
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFFF7F6F6),
        ),
        body: isLoading
            ? const Center(
                child: CircularProgressIndicator(),
              )
            : (orderModel?.orders?.isEmpty ?? true)
                ? _buildEmptyState()
                : RefreshIndicator(
                    onRefresh: () async {
                      setState(() {
                        selectedType = '';
                        selectedTime = '';
                      });
                      await fetchData();
                    },
                    child: Column(
                      children: [
                        Expanded(
                          child: ListView.builder(
                            itemCount: orderModel?.orders?.length ?? 0,
                            itemBuilder: (context, index) {
                              final order = orderModel!.orders![index];
                              return _buildOrderCard(
                                  order, order.products!.first);
                              return Container();
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
bool dataIsEmpty = false;
  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 10,
                right: 10,
                top: 10,
                bottom: MediaQuery.of(context).viewInsets.bottom + 10,
              ),
              child: Wrap(
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.min, // Shrinks to fit content
                    children: [
                      Row(
                        children: [
                          const Text(
                            "Filter",
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
                      Row(
                        children: [
                          Text(
                            'Order Type',
                            style: GoogleFonts.roboto(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      RadioListTile(
                        value: "pending",
                        groupValue: selectedType,
                        title: const Text(
                          'InProgress',
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF4E505B),
                          ),
                        ),
                        onChanged: (value) {
                          setModalState(() {
                            selectedType = ((selectedType == value) ? null : value.toString())!;
                          });
                        },
                      ),
                      RadioListTile(
                        value: "completed",
                        groupValue: selectedType,
                        title: const Text(
                          'Completed',
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF4E505B),
                          ),
                        ),
                        onChanged: (value) {
                          setModalState(() {
                            selectedType = ((selectedType == value) ? null : value.toString())!;
                          });
                        },
                      ),
                      RadioListTile(
                        value: "cancelled",
                        groupValue: selectedType,
                        title: const Text(
                          'Cancelled',
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF4E505B),
                          ),
                        ),
                        onChanged: (value) {
                          setModalState(() {
                            selectedType = ((selectedType == value) ? null : value.toString())!;
                          });
                        },
                      ),
                      Row(
                        children: [
                          Text(
                            'Time Filter',
                            style: GoogleFonts.roboto(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      RadioListTile(
                        value: "current",
                        groupValue: selectedTime,
                        title: const Text(
                          'Current Month',
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF4E505B),
                          ),
                        ),
                        onChanged: (value) async {
                          setModalState(() {
                            print('selected time previous $value');

                            selectedTime = (selectedTime == value ? '' : value.toString());
                          });
                          // bool result = await fetchData();
                          // setModalState(() {
                          //   dataIsEmpty = !result;
                          // });
                        },
                      ),
                      RadioListTile(
                        value: "previous",
                        groupValue: selectedTime,
                        title: const Text(
                          'Previous Month',
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF4E505B),
                          ),
                        ),
                        onChanged: (value) async {
                          setModalState(() {
                            print('selected time previous $value');
                            selectedTime = (selectedTime == value ? '' : value.toString());
                          });
                          // bool result = await fetchData();
                          // setModalState(() {
                          //   dataIsEmpty = !result;
                          // });
                        },
                      ),
                      const SizedBox(height: 10),
                      dataIsEmpty
                          ? const Text(
                        "No data found",
                        style: TextStyle(color: Colors.red),
                      )
                          : _buildApplyFilterButton(),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }


  Widget _buildApplyFilterButton() {
    return Padding(
      padding: const EdgeInsets.all(15.0),
      child: Container(
        width: 351,
        height: 60,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(30),
        ),
        child: ElevatedButton(
          onPressed: () {
            fetchData();
            Navigator.pop(context);
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            padding: EdgeInsets.zero,
          ),
          child: const Text(
            "Apply Filter",
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOrderCard(
    Orders order,
    ProductsTQ products,
  ) {
    return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Container(
          height: 120,
          width: 351,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.3),
                spreadRadius: 1,
                blurRadius: 3,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatusBadge(order.status!),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      "Order ID ",
                      style: GoogleFonts.lato(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                    Text(
                      "#${order.orderId}",
                      style: GoogleFonts.lato(
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF121212),
                          fontSize: 12),
                    ),
                  ],
                ),
                Column(
                  children: [
                    Text(
                      formatOrderDate(order.createdAt ?? ''),
                      style: GoogleFonts.lato(
                        fontWeight: FontWeight.w500,
                        fontSize: 12,
                        color: const Color(0xFF4E505B),
                      ),
                    ),
                    Text(
                      formatOrderTime(order.createdAt ?? ''),
                      style: GoogleFonts.lato(
                        fontWeight: FontWeight.w500,
                        fontSize: 12,
                        color: const Color(0xFF4E505B),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(),
            Padding(
              padding: const EdgeInsets.all(5.0),
              child: Row(children: [
                Expanded(
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                "Total Products",
                                style: GoogleFonts.lato(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                  color: Colors.grey,
                                ),
                              ),
                              Text(
                                "${order.products!.length} Product${order.products!.length > 1 ? 's' : ''}",
                                style: GoogleFonts.lato(
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF121212),
                                    fontSize: 12),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                "Total Payments",
                                style: GoogleFonts.lato(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                    color: Colors.grey),
                              ),
                              Text(
                                "Rs. ${order.grandTotal}",
                                style: GoogleFonts.lato(
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF121212),
                                    fontSize: 12),
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: () {
                              print('productid ${order.sId}');
                              Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => OrderHistoryScreen(
                                          productId: order.sId ?? '')));
                            },
                            child: const Row(
                              children: [
                                Text(
                                  "See More",
                                  style: TextStyle(
                                      fontFamily: 'Satoshi',
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF184282)),
                                ),
                                Icon(
                                  Icons.arrow_forward_ios,
                                  size: 14,
                                  color: Color(0xFF184282),
                                )
                              ],
                            ),
                          )
                        ],
                      ),
                    ],
                  ),
                ),
              ]),
            )
          ]),
        ));
  }

  Widget _buildStatusBadge(String mystatus) {
    Color badgeColor;

    String displayStatus;

    switch (mystatus.toLowerCase()) {
      case 'completed':
        badgeColor = const Color(0xFF19790A);
        displayStatus = 'Completed';
        break;
      case 'pending':
        badgeColor = const Color(0xFFC87C10);
        displayStatus = 'InProgress';
        break;
      case 'cancelled':
        badgeColor = Colors.red;
        displayStatus = 'Cancelled';
        break;
      default:
        badgeColor = Colors.grey;
        displayStatus = 'Unknown'; // Handle unknown status
    }

    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
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
      ),
    );
  }
}
