import 'dart:async';
import 'package:flutter/material.dart';

class PlaceorderSuccess extends StatefulWidget {
  const PlaceorderSuccess({super.key});

  @override
  State<PlaceorderSuccess> createState() => _PlaceorderSuccessState();
}

class _PlaceorderSuccessState extends State<PlaceorderSuccess> {
  @override
  void initState() {
    super.initState();
    // Navigate to the home page after 2 seconds
    Timer(const Duration(seconds: 2), () {
      Navigator.pushReplacementNamed(context, '/bottomNavigation'); // Ensure this route points to HomeScreen with BottomNavigationBar
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1F5DA5), // #1F5DA5
              Color(0xFF184282), // #184282
            ],
          ),
        ),
        child: Center(
          child: SizedBox(
            width: 285,
            height: 353,
            child: Image.asset(
              "assets/images/placeordersuccess.png",
              fit: BoxFit.cover,
            ),
          ),
        ),
      ),
    );
  }
}
