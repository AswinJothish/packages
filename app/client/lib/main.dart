import 'package:client/bottom_navigation.dart';
import 'package:client/pages/categories/categoryproduct_screen.dart';
import 'package:client/pages/addcart_page.dart';
import 'package:client/pages/home_page.dart';
import 'package:client/pages/login_screen.dart';
import 'package:client/pages/manage_address_page.dart';
import 'package:client/pages/order_page.dart';
import 'package:client/pages/productDetail_page.dart';
import 'package:client/pages/productViewall_page.dart';
import 'package:client/pages/product_preview.dart';
import 'package:client/pages/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'bottom_navigation.dart';
import 'common/dio_client.dart';
import 'pages/addcart_page.dart';
import 'pages/categories/categoryproduct_screen.dart';
import 'pages/home_page.dart';
import 'pages/manage_address_page.dart';
import 'pages/order_page.dart';
import 'pages/productDetail_page.dart';
import 'pages/productViewall_page.dart';
import 'pages/product_preview.dart';

void main() {
  ApiClient.initialize();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Flutter Demo',debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
        fontFamily: 'Satoshi'
      ),
      getPages: [
        GetPage(name: '/bottomNavigation', page: () => const BottomNavigation()),
        GetPage(name: '/homeScreen', page: () => const HomePage()),
        GetPage(name: '/productViewallpage', page: () => const ProductviewallPage(isAscending: true,)),
        GetPage(name: '/categoryproductScreen', page: () => const CategoryproductScreen(categoryName: '',)),
        GetPage(name: '/productdetailPage', page: () => const ProductdetailPage(product: null,)),
        GetPage(name: '/addcart', page: () => const AddcartPage()),
        GetPage(name: '/productPreview', page: () => const ProductPreview()),
        GetPage(name: '/manageAddresspage', page: () => const ManageAddressPage()),
        GetPage(name: '/orderPage', page: () => const OrderPage())

      ],
      home: const SplashScreen(),
    );
  }
}
