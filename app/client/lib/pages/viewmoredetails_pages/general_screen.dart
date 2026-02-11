import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../api_services/productdetail_api.dart';
import '../../model/productdetail_model.dart';
import 'package:google_fonts/google_fonts.dart';

class GeneralScreen extends StatefulWidget {
  const GeneralScreen({super.key});

  @override
  State<GeneralScreen> createState() => _GeneralScreenState();
}

class _GeneralScreenState extends State<GeneralScreen> {
  General general = General();
  bool isLoading = true;
  final ProductDetailService productDetails = ProductDetailService();

  @override
  void initState() {
    super.initState();
    String productId = Get.arguments;
    getProductDetail(productId);
  }

  getProductDetail(String productId) async {
    dynamic value = await productDetails.fetchProductById(productId);
    setState(() {
      general = value.general ?? General();
      isLoading = false;
      log('General: $general');
    });
  }

  @override
  Widget build(BuildContext context) {
    Map<String, String> generalData = general.toMap(); // Ensure it's a map

    return Scaffold(
      backgroundColor: Colors.white,
      body: isLoading
          ? const Center(
        child: CircularProgressIndicator(),
      )
          : Padding(
        padding: const EdgeInsets.all(20.0),
        child: ListView.builder(
          itemCount: generalData.length,
          itemBuilder: (context, index) {
            final entry = generalData.entries.elementAt(index);
            Color backgroundColor =
            index.isEven ? const Color(0xFFFFFFFF) : const Color(0xFFFBFAFA);

            return Container(
              width: double.infinity,
              color: backgroundColor,
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    flex: 2,
                    child: Text(
                      entry.key,
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 16,
                          color: Colors.black54,
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      entry.value,
                      style: GoogleFonts.roboto(
                        textStyle: const TextStyle(
                          fontSize: 16,
                          color: Color(0xFF090F47),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
