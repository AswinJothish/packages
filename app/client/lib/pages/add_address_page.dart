import 'package:client/model/addaddress_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../api_services/yourcart_api.dart';
import '../contants/pref.dart';
import '../model/yourcart_model/getcart_model.dart';

class AddAddressPage extends StatefulWidget {
  const AddAddressPage({super.key});

  @override
  State<AddAddressPage> createState() => _AddAddressPageState();
}

class _AddAddressPageState extends State<AddAddressPage> {
  final _formKey = GlobalKey<FormState>();

  final _flatNumberController = TextEditingController();
  final _areaLocalityController = TextEditingController();
  final _landmarkController = TextEditingController();
  final _receiverNameController = TextEditingController();
  final _receiverPhoneNumberController = TextEditingController();

  String? selectedAddressType; // To keep track of selected radio button
  final List<String> addressTypes = ['Home', 'Office', 'Other'];

  final YourcartApi yourcartApi = YourcartApi();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: AppBar(
        title: Text(
          'Add Address',
          style: GoogleFonts.roboto(
            textStyle: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold, // Make the header bold
              color: Colors.black,
            ),
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
                Center(
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
                      onPressed: () async {
                        if (_formKey.currentState!.validate() && selectedAddressType != null) {
                          AddAddress address = AddAddress(
                            flatNumber: _flatNumberController.text,
                            area: _areaLocalityController.text,
                            nearbyLandmark: _landmarkController.text,
                            receiverName: _receiverNameController.text,
                            receiverMobileNumber: _receiverPhoneNumberController.text,
                          );
                          String? userId = await SharedPrefsHelper.getString('userId');

                          AddAddressModel addaddress = AddAddressModel(
                            customerId: userId,
                            address: address,
                            tag: selectedAddressType,
                          );
                          await yourcartApi.addAddress(addaddress);
                          Navigator.pop(context);
                        } else if (selectedAddressType == null) {
                          setState(() {}); // Update UI to show validation message for address type
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                      ),
                      child: Text(
                        'Add Address',
                        style: GoogleFonts.lato(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
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

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: GoogleFonts.lato(
        fontSize: 14,
        fontWeight: FontWeight.bold, // Bold for the labels
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
    int? maxLength,
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
