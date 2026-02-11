import 'dart:developer';

import 'package:client/model/bottomNavigation_model.dart';
import 'package:client/pages/home_page.dart';
import 'package:client/pages/order_page.dart';
import 'package:client/pages/profile_page.dart';
import 'package:flutter/material.dart';

import 'contants/pref.dart';
import 'pages/home_page.dart';
import 'pages/order_page.dart';
import 'pages/profile_page.dart';

class BottomNavigation extends StatefulWidget {
  const BottomNavigation({super.key});

  @override
  State<BottomNavigation> createState() => _BottomNavigationState();
}

class _BottomNavigationState extends State<BottomNavigation> {
  int dindex = 0;
  String? userId; // This will hold the fetched userId

  final List<Widget> pages = [
    const HomePage(),
    const OrderPage(),
    const ProfilePage(),
  ];

  final List<Widget> newuserpage = [
    const HomePage(),
    const ProfilePage(),
  ];

  List<BottomNavigationmodel> newuserbottommenus = [
    BottomNavigationmodel("assets/images/Homefilled.png",
        "assets/images/Homeborder.png", "Home", Colors.white),
    BottomNavigationmodel("assets/images/Profilefilled.png",
        "assets/images/Profileborder.png", "Profile", Colors.white),
  ];

  List<BottomNavigationmodel> bottommenus = [
    BottomNavigationmodel("assets/images/Homefilled.png",
        "assets/images/Homeborder.png", "Home", Colors.white),
    BottomNavigationmodel("assets/images/Ordersfilled.png",
        "assets/images/Ordersborder.png", "Orders", Colors.white),
    BottomNavigationmodel("assets/images/Profilefilled.png",
        "assets/images/Profileborder.png", "Profile", Colors.white),
  ];

  @override
  void initState() {
    super.initState();
    dindex = 0;
    initialUsercheck();
  }

  // This method checks if userId exists
  initialUsercheck() async {
    String? fetchedUserId = await SharedPrefsHelper.getString('userId');
    setState(() {
      userId = fetchedUserId;
      log("USERID:$userId");
    });
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      body: userId==null
          ? newuserpage[dindex]  // If userId is empty (null), show new user pages
          : pages[dindex],        // If userId is not empty, show the main pages
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF1F5DA5), // #1F5DA5
              Color(0xFF184282), // #184282
            ],
          ),
        ),
        child: BottomNavigationBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          items: userId==null
              ? newuserbottommenus.map((menu) { // If userId is empty, show new user menus
            return BottomNavigationBarItem(
              icon: Image.asset(
                dindex == newuserbottommenus.indexOf(menu)
                    ? menu.selectedimg
                    : menu.unselectedimg,
                width: 24,
                height: 24,
              ),
              label: menu.text1,
            );
          }).toList()
              : bottommenus.map((menu) {  // If userId is not empty, show normal menus
            return BottomNavigationBarItem(
              icon: Image.asset(
                dindex == bottommenus.indexOf(menu)
                    ? menu.selectedimg
                    : menu.unselectedimg,
                width: 24,
                height: 24,
              ),
              label: menu.text1,
            );
          }).toList(),
          currentIndex: dindex,
          selectedItemColor: Colors.white,
          unselectedItemColor: Colors.white,
          onTap: (int select) {
            setState(() {
              dindex = select;
            });
          },
        ),
      ),
    );
  }
}
