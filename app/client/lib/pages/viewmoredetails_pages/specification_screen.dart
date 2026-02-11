import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../api_services/productdetail_api.dart';
import '../../model/productdetail_model.dart';

class SpecificationScreen extends StatefulWidget {
  const SpecificationScreen({super.key});

  @override
  State<SpecificationScreen> createState() => _SpecificationScreenState();
}

class _SpecificationScreenState extends State<SpecificationScreen> {
  Map<String, Map<String, String>> specificationsData = {};
  bool isLoading = true;
  final ProductDetailService productDetails = ProductDetailService();
  Specifications specifications = Specifications();

  @override
  void initState() {
    super.initState();
    String productId = Get.arguments;
    getProductDetail(productId);
  }

  getProductDetail(String productId) async {
    dynamic value = await productDetails.fetchProductById(productId);
    setState(() {
      specifications = value.specifications ?? Specifications();

      // Convert Specifications object to Map<String, Map<String, String>>
      specificationsData = specifications.toJson().map(
            (key, value) {
          if (value is Map<String, dynamic>) {
            return MapEntry(
              key,
              value.map((k, v) => MapEntry(k.toString(), v.toString())),
            );
          }
          return MapEntry(key, {});
        },
      );

      isLoading = false;
      print('Specifications Data: $specificationsData');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: specificationsData.entries.map((specEntry) {
              String category = specEntry.key;
              Map<String, String> attributes = specEntry.value;

              return Container(
                margin: const EdgeInsets.only(bottom: 8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Text(
                        category,
                        style: GoogleFonts.roboto(
                          textStyle: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ),
                    ...attributes.entries.map((entry) {
                      int index = attributes.keys.toList().indexOf(entry.key);
                      Color backgroundColor = index.isEven ? Colors.white : const Color(0xFFFBFAFA);

                      return Container(
                        width: double.infinity,
                        color: backgroundColor,
                        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 10.0),
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
                            const SizedBox(width: 20),
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
                    }),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
