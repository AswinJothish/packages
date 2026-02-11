import 'package:client/model/order_model.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:path/path.dart';

import '../api_services/yourcart_api.dart';
import '../contants/pref.dart';
import '../model/addaddress_model.dart';
import '../model/get_address_model.dart';

class EditAddressPage extends StatefulWidget {
  final DeliveryAddressList initialAddress;
  final String addressId;

  const EditAddressPage({super.key, required this.initialAddress, required this.addressId});

  @override
  State<EditAddressPage> createState() => _EditAddressPageState();
}

class _EditAddressPageState extends State<EditAddressPage> {
  final _formKey = GlobalKey<FormState>();

  final _flatNumberController = TextEditingController();
  final _areaLocalityController = TextEditingController();
  final _landmarkController = TextEditingController();
  final _receiverNameController = TextEditingController();
  final _receiverPhoneNumberController = TextEditingController();

  String? selectedAddressType;
  GetAddressModel? addressModel;

  final YourcartApi yourcartApi = YourcartApi();


  final List<String> addressTypes = [
    'Home',
    'Office',
    'Other',
  ];

  @override
  void initState() {
    super.initState();

    // Initialize controllers with the existing address data
    _flatNumberController.text = widget.initialAddress!.address?.flatNumber ?? '';
    _areaLocalityController.text = widget.initialAddress!.address?.area ?? '';
    _landmarkController.text = widget.initialAddress!.address?.nearbyLandmark ?? '';
    _receiverNameController.text = widget.initialAddress!.address?.receiverName ?? '';
    _receiverPhoneNumberController.text = widget.initialAddress!.address?.receiverMobileNumber?? '';
    selectedAddressType = widget.initialAddress.tag;
    }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: AppBar(
        title: const Text(
          'Edit Address',
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
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildLabel('Flat Number*'),
                const SizedBox(height: 8.0),
                _buildTextField(
                  controller: _flatNumberController,
                  hintText: 'Enter flat number',
                  icon: Icons.location_on,
                  onClear: () => _flatNumberController.clear(),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Flat number is required';
                    }
                    return null;
                  },
                ),
                _buildLabel('Area / Locality*'),
                const SizedBox(height: 8.0),
                _buildTextField(
                  controller: _areaLocalityController,
                  hintText: 'Enter area/locality',
                  icon: Icons.location_on,
                  onClear: () => _areaLocalityController.clear(),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Area or locality is required';
                    }
                    return null;
                  },
                ),
                _buildLabel('Near by landmark*'),
                const SizedBox(height: 8.0),
                _buildTextField(
                  controller: _landmarkController,
                  hintText: 'Enter landmark',
                  icon: Icons.location_on,
                  onClear: () => _landmarkController.clear(),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Landmark is required';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16.0),
                _buildLabel('Save as*'),
                const SizedBox(height: 8.0),
                Row(
                  children: addressTypes.map((type) {
                    return Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedAddressType = type;
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4.0),
                          height: 24,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: selectedAddressType == type
                                  ? const Color(0xFF283891)
                                  : const Color(0xFFE6E7ED),
                            ),
                            color: Colors.white,
                          ),
                          child: Center(
                            child: Text(
                              type,
                              style: GoogleFonts.roboto(
                                textStyle: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: selectedAddressType == type
                                      ? const Color(0xFF090F47)
                                      : const Color(0xFF404040),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                if (selectedAddressType == null) // Validation message
                  const Padding(
                    padding: EdgeInsets.only(top: 8.0),
                    child: Text(
                      'Please select an address type',
                      style: TextStyle(color: Colors.red,fontSize: 12),
                    ),
                  ),
                const SizedBox(height: 16.0),
                _buildLabel('Receiver Name*'),
                const SizedBox(height: 8.0),
                _buildTextField(
                  controller: _receiverNameController,
                  hintText: 'Enter receiver name',
                  icon: Icons.person,
                  onClear: () => _receiverNameController.clear(),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Receiver name is required';
                    }
                    return null;
                  },
                ),
                _buildLabel('Receiver phone number*'),
                const SizedBox(height: 8.0),
                _buildTextField(
                  controller: _receiverPhoneNumberController,
                  hintText: 'Enter receiver phone number',
                  icon: Icons.phone,
                  maxLength: 10,
                  keyboardType: TextInputType.phone,
                  onClear: () => _receiverPhoneNumberController.clear(),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Phone number is required';
                    } else if (value.length != 10) {
                      return 'Phone number must be 10 digits';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 80.0),

                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Center(
                    child: Container(
                      width: double.infinity,
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
                        onPressed: ()async {
                          String? userId = await SharedPrefsHelper.getString('userId');
                          print("addressId ${widget.addressId}");
                          if (_formKey.currentState!.validate()) {
                            AddAddress address = AddAddress(
                              id: widget.addressId,
                              flatNumber: _flatNumberController.text,
                              area: _areaLocalityController.text,
                              nearbyLandmark: _landmarkController.text,
                              receiverName: _receiverNameController.text,
                              receiverMobileNumber:
                              _receiverPhoneNumberController.text,
                            );
                            AddAddressModel addaddress = AddAddressModel(
                              customerId: userId,
                              address: address,
                              tag: selectedAddressType,
                            );
                            await yourcartApi.editAddress(addaddress);
                            Navigator.pop(context);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30.0),
                          ),
                        ),
                        child: const Text(
                          'Update Address',
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
      ),
    );
  }

  Widget _buildLabel(String text, {bool isContactDetails = false}) {
    return Text(
      text,
      style: TextStyle(
        fontFamily: 'Satoshi',
        fontSize: isContactDetails ? 18 : 14,
        fontWeight: FontWeight.w500,
        color: const Color(0xFF121212),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hintText,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    required VoidCallback onClear,
    String? Function(String?)? validator,
    int? maxLength, // Add an optional maxLength parameter
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 10),
      height: 55,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xff090f471a)),
      ),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        maxLength: maxLength,
        inputFormatters: maxLength != null
            ? [LengthLimitingTextInputFormatter(maxLength)]
            : null,
        decoration: InputDecoration(
            counterText: '',
            contentPadding: const EdgeInsets.all(12),
            hintText: hintText,
            hintStyle: GoogleFonts.roboto(
              fontSize: 14,
              color: const Color(0xFF121212), // Keep the hint text normal
            ),
            border: InputBorder.none,
            prefixIcon: Icon(icon, color:  Colors.black38),
            suffixIcon:  IconButton(
              icon:  const Icon(Icons.clear, color: Colors.black38),
              onPressed: onClear,
            )

        ),
        validator: validator,
        onChanged: (value) {
          setState(() {}); // Update the state to remove error message when typing starts
        },
      ),
    );
  }

}


