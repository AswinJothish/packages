import 'package:client/api_services/yourcart_api.dart';
import 'package:client/model/get_address_model.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api_services/profile_user_api.dart';
import '../contants/pref.dart';
import '../model/user_model.dart';
import 'add_address_page.dart';
import 'edit_address_page.dart';

class ManageAddressPage extends StatefulWidget {
  const ManageAddressPage({super.key});

  @override
  State<ManageAddressPage> createState() => _ManageAddressPageState();
}

class _ManageAddressPageState extends State<ManageAddressPage> {
  String? selectedAddress;
  GetAddressModel? addressModel;
  bool isLoading = true;

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
          setState(() {
            addressModel?.deliveryAddress = [];
          });
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
    fetchGetAddress(); // Fetch addresses on init
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: AppBar(
        title: const Text(
          'Manage Address',
          style: TextStyle(
            fontFamily: 'Satoshi',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.black,
          ),
        ),
        backgroundColor: const Color(0xFFF7F6F6),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : (addressModel == null ||
                  addressModel!.deliveryAddress == null ||
                  addressModel!.deliveryAddress!.isEmpty)
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'No addresses found.',
                        style: TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Colors.black54,
                        ),
                      ),
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
                            fontFamily: 'Satoshi',
                            fontSize: 14.0,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF184282),
                          ),
                        ),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
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
                              fontFamily: 'Satoshi',
                              fontSize: 14.0,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF184282),
                            ),
                          ),
                        ),
                      ],
                    ),
                    addressModel!.deliveryAddress!.isEmpty
                        ? const SizedBox()
                        : Expanded(
                            child: ListView.builder(
                              padding: const EdgeInsets.all(8.0),
                              itemCount: addressModel!.deliveryAddress!.length,
                              itemBuilder: (context, index) {
                                final address =
                                    addressModel!.deliveryAddress![index];
                                return Padding(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 4.0),
                                  child: Container(
                                    width: double.infinity,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: selectedAddress == address.tag
                                            ? const Color(0xff4e505b6b)
                                            : const Color(0xff090f471a),
                                      ),
                                      color: Colors.white,
                                    ),
                                    child: ListTile(
                                      leading: const Icon(Icons.location_on),
                                      title: Text(
                                        address.tag ?? '',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold),
                                      ),
                                      subtitle: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            address.address!.area ?? '',
                                            style: GoogleFonts.roboto(
                                                fontWeight: FontWeight.w400,
                                                color: const Color(0xFF121212),
                                                fontSize: 14),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                              address.address!
                                                      .receiverMobileNumber ??
                                                  '',
                                              style: GoogleFonts.roboto(
                                                  fontWeight: FontWeight.w400,
                                                  color:
                                                      const Color(0xFF121212),
                                                  fontSize: 14)),
                                        ],
                                      ),
                                      trailing: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            onPressed: () {
                                              String addressType =
                                                  address.id ?? "";
                                              String addressId =
                                                  addressType ?? "";
                                              print('addressId $addressId');
                                              Address addresslist = Address(
                                                  flatNumber: address
                                                      .address!.flatNumber);
                                              DeliveryAddressList deliveryList =
                                                  DeliveryAddressList(
                                                      address: addresslist);
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      EditAddressPage(
                                                    addressId: addressId,
                                                    initialAddress: address,
                                                  ),
                                                ),
                                              ).whenComplete(
                                                () => fetchGetAddress(),
                                              );
                                            },
                                            icon: Image.asset(
                                              "assets/images/editicon.png",
                                              width: 16.0,
                                              height: 16.0,
                                            ),
                                          ),
                                          IconButton(
                                            onPressed: () {
                                              showDialog(
                                                context: context,
                                                builder:
                                                    (BuildContext context) {
                                                  return AlertDialog(
                                                    shape:
                                                        RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              10),
                                                    ),
                                                    title: const Center(
                                                      child: Text(
                                                          'Confirm Delete'),
                                                    ),
                                                    content: const Text(
                                                        'Are you sure you want to delete this address?'),
                                                    actions: [
                                                      TextButton(
                                                        onPressed: () {
                                                          Navigator.pop(
                                                              context);
                                                        },
                                                        child: const Text(
                                                          'Cancel',
                                                          style: TextStyle(
                                                              color:
                                                                  Colors.grey),
                                                        ),
                                                      ),
                                                      TextButton(
                                                        onPressed: () async {
                                                          Navigator.pop(context);
                                                          String? userId =
                                                              await SharedPrefsHelper
                                                                  .getString(
                                                                      'userId');
                                                          String addressType =
                                                              address.id ?? "";
                                                          String addressId =
                                                              addressType;
                                                          bool isRemoved =
                                                              await YourcartApi()
                                                                  .deleteAddress(
                                                            userId ?? '',
                                                            addressId,
                                                          );
                                                          if (isRemoved) {
                                                            print(
                                                                'Address removed successfully');
                                                            ScaffoldMessenger
                                                                    .of(context)
                                                                .showSnackBar(
                                                              const SnackBar(
                                                                content: Text(
                                                                    'Address removed successfully'),
                                                              ),
                                                            );
                                                            fetchGetAddress();
                                                          } else {
                                                            // The value could not be removed (likely it didn't exist)
                                                            print(
                                                                'Failed to remove data');
                                                          }
                                                        },
                                                        child: const Text(
                                                          'Delete',
                                                          style: TextStyle(
                                                              color:
                                                                  Colors.red),
                                                        ),
                                                      ),
                                                    ],
                                                  );
                                                },
                                              );
                                            },
                                            icon: const Icon(
                                              Icons.delete_outline_outlined,
                                              size: 19,
                                            ),
                                          ),
                                        ],
                                      ),
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                              horizontal: 8),
                                      onTap: () {
                                        setState(() {
                                          selectedAddress =
                                              address.tag; // Select address
                                        });
                                      },
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                  ],
                ),
    );
  }
}
