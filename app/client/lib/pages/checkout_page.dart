import 'package:client/model/place_order_model.dart';
import 'package:client/pages/add_address_page.dart';
import 'package:client/pages/edit_address_page.dart';
import 'package:client/pages/placeorder_success.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../api_services/yourcart_api.dart';
import '../common/common.dart';
import '../contants/pref.dart';
import '../controller/yourcartcontroller.dart';
import '../model/get_address_model.dart';
import '../model/paymentsummaryrow.dart';
import '../model/yourcart_model/getcart_model.dart';

class CheckoutPage extends StatefulWidget {
  final String count;
  final String totalAmount;
  final List<Map<String,dynamic>> productList;

  const CheckoutPage(
      {super.key, required this.count, required this.totalAmount,required this.productList});

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final Yourcartcontroller yourcartController = Get.put(Yourcartcontroller());

  String? selectedAddress;
  bool isLoading = true;

  GetAddressModel? addressModel;

  Future<void> fetchGetAddress() async {
    setState(() {
      isLoading = true;
    });

    String? userId = await SharedPrefsHelper.getString('userId');
    if (userId != null) {
      try {
        var value = await YourcartApi().getAddress(userId);

        if (value != null) {
          // Log the fetched value for debugging
          print("Fetched address model: $value");

          setState(() {
            addressModel = value;
          });
        } else {
          // Handle case where no address model is returned
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No addresses found.'),
              duration: Duration(seconds: 2),
              backgroundColor: Colors.red,
            ),
          );
        }
      } catch (e) {
        // Handle any exceptions that occur during the API call
        print("Error fetching addresses: $e");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error fetching addresses. Please try again.'),
            duration: Duration(seconds: 2),
            backgroundColor: Colors.red,
          ),
        );
      } finally {
        setState(() {
          isLoading = false; // Stop loading after processing
        });
      }
    } else {
      setState(() {
        isLoading = false; // No user ID, stop loading
      });
    }
  }

  @override
  void initState() {
    super.initState();
    print('Product List: ${widget.productList}');
    fetchGetAddress();
  }


  Future<void> placeOrder() async {
    try {
      String? userName = await SharedPrefsHelper.getString('userName');
      String? userId = await SharedPrefsHelper.getString('userId');
      String? userDataId = await SharedPrefsHelper.getString('userDataId');

      if (userName != null && userId != null && widget.productList.isNotEmpty) {
        // Find the selected delivery address
        final selectedDeliveryAddress = addressModel?.deliveryAddress?.firstWhere(
              (address) => address.id == selectedAddress,
        );

        if (selectedDeliveryAddress != null) {
          Map<String, dynamic> deliveryAddress = {
           selectedDeliveryAddress.tag!.toLowerCase()??"":{
            "flatNumber": selectedDeliveryAddress.address?.flatNumber ?? '',
            "area": selectedDeliveryAddress.address?.area ?? '',
            "nearbyLandmark": selectedDeliveryAddress.address?.nearbyLandmark ?? '',
            "receiverName": selectedDeliveryAddress.address?.receiverName ?? '',
            "receiverMobileNumber": selectedDeliveryAddress.address?.receiverMobileNumber ?? '',}
          };

          OrderRequest orderRequest = OrderRequest(
            orderedBy: userName.isNotEmpty? userName:userDataId??"",
            customerId: userId,
            products: widget.productList,
            deliveryAddress: deliveryAddress,
            deliveryCharges: 0,
            grandTotal: double.parse(widget.totalAmount).toInt(),
          );

          var value = await YourcartApi().placeOrder(orderRequest);

        } else {
          print('No selected delivery address found.');
        }
      } else {
        print('Invalid user details or empty product list.');
      }
    } catch (e) {
      print('Error in placeOrder: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: AppBar(
        title: const Text(
          'Checkout',
          style: TextStyle(
            fontFamily: 'Satoshi',
            fontSize: 18.0,
            fontWeight: FontWeight.w700,
            height: 24.3 / 18.0,
            color: Colors.black,
          ),
          textAlign: TextAlign.left,
        ),
        backgroundColor: const Color(0xFFF7F6F6),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Cart summary section
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "${widget.count} items in your cart",
                            style: const TextStyle(
                              fontFamily: 'Satoshi',
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF4E505B),
                            ),
                          ),
                          Column(
                            children: [
                              const Text(
                                "TOTAL",
                                style: TextStyle(
                                  fontFamily: 'Satoshi',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF184282),
                                ),
                              ),
                              Text(
                                'Rs.${widget.totalAmount}',
                                style: const TextStyle(
                                  fontFamily: 'Overpass',
                                  fontSize: 16.0,
                                  fontWeight: FontWeight.w600,
                                  height: 20.26 / 16.0,
                                  color: Color(0xFF1B4C8F),
                                ),
                                textAlign: TextAlign.right,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Receiver Name input
                    const Text(
                      'Receiver Name*',
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        height: 20.26 / 16.0,
                        color: Color(0xFF09101D),
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    _buildTextField(
                      controller: _nameController,
                      hintText: 'Receiver Name',
                      icon: Icons.person,
                      onClear: () => _nameController.clear(),
                    ),

                    // Receiver Phone input
                    const SizedBox(height: 8),
                    const Text('Receiver Phone Number*',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8.0),
                    _buildTextField(
                      controller: _phoneController,
                      hintText: 'Enter receiver phone number',
                      icon: Icons.phone,
                      keyboardType: TextInputType.phone,
                      onClear: () => _phoneController.clear(),
                    ),

                    // Address selection
                    // Address selection
                    const SizedBox(height: 8.0),
                    const Text('Delivery Address',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8.0),
                    if (addressModel == null ||
                        addressModel!.deliveryAddress == null ||
                        addressModel!.deliveryAddress!.isEmpty)
                      const Center(
                        child: Text(
                          'No delivery addresses. Please add one.',
                          style: TextStyle(
                            fontFamily: 'Satoshi',
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF4E505B),
                          ),
                        ),
                      )
                    else
                      SizedBox(
                        height: 300,
                        child: ListView.builder(
                          shrinkWrap: true,
                          physics: const BouncingScrollPhysics(),
                          itemCount: addressModel!.deliveryAddress!.length,
                          itemBuilder: (context, index) {
                            final address =
                                addressModel!.deliveryAddress![index];
                            return Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 4.0),
                              child: Container(
                                width: double.infinity,
                                height: 81,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: selectedAddress == address.id
                                        ? const Color(0xff4e505b6b)
                                        : const Color(0xff090f471a),
                                  ),
                                  color: Colors.white,
                                ),
                                child: RadioListTile<String>(
                                  value: address.id!,
                                  groupValue: selectedAddress,
                                  title: Row(
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              address.tag!,
                                              style: const TextStyle(
                                                  fontFamily: 'Satoshi',
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w700,
                                                  color: Color(0xFF393E48)),
                                            ),
                                            Text(
                                              address.address!.flatNumber!,
                                              style: const TextStyle(
                                                  fontFamily: 'Satoshi',
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w400,
                                                  color: Color(0xFF4E505B)),
                                            ),
                                            Text(
                                              address.address!.area!,
                                              style: const TextStyle(
                                                  fontFamily: 'Satoshi',
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w400,
                                                  color: Color(0xFF4E505B)),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const Spacer(),
                                      IconButton(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  EditAddressPage(
                                                addressId: address.id ?? '',
                                                initialAddress: address,
                                              ),
                                            ),
                                          ).whenComplete(
                                              () => fetchGetAddress());
                                        },
                                        icon: Image.asset(
                                          "assets/images/editicon.png",
                                          width: 16.0,
                                          height: 16.0,
                                        ),
                                      ),
                                    ],
                                  ),
                                  contentPadding:
                                      const EdgeInsets.symmetric(horizontal: 8),
                                  onChanged: (value) {
                                    setState(() {
                                      selectedAddress = value;
                                      _nameController.text =
                                          address.address!.receiverName ?? '';
                                      _phoneController.text = address
                                              .address!.receiverMobileNumber ??
                                          '';
                                    });
                                  },
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                    // Add address button with limit check
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => const AddAddressPage()),
                            ).whenComplete(
                                () => fetchGetAddress(),
                              );
                          },
                          icon: const Icon(Icons.add),
                          label: const Text(
                            'Add Address',
                            style: TextStyle(
                              fontFamily: 'Overpass',
                              fontSize: 14.0,
                              fontWeight: FontWeight.w400,
                              height: 18.0 / 14.0,
                              color: Color(0xFF184282),
                            ),
                            textAlign: TextAlign.right,
                          ),
                        ),
                      ],
                    ),
                    // Place Order button
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
                              if (addressModel == null ||
                                  addressModel!.deliveryAddress == null ||
                                  addressModel!.deliveryAddress!.isEmpty) {
                                // No addresses found, prompt user to add an address
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Please add an address before placing the order.'),
                                    duration: Duration(seconds: 2),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              } else if (selectedAddress == null) {
                                // Address list is not empty but no address is selected
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Please select an address before placing the order.'),
                                    duration: Duration(seconds: 2),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              } else {
                            await    placeOrder();
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const PlaceorderSuccess()),
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                            ),
                            child: const Text(
                              'Place Order',
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
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  // Helper method to build a text field with icon and clear button
  Widget _buildTextField({
    required TextEditingController controller,
    required String hintText,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    required VoidCallback onClear,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 10),
      width: double.infinity,
      height: 55,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xff090f471a)),
        color: const Color(0xFFFFFFFF),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        enableInteractiveSelection: false,
        readOnly: true,
        decoration: InputDecoration(
          hintText: hintText,
          prefixIcon: Icon(icon, size: 20, color: const Color(0xFF4E505B)),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}
