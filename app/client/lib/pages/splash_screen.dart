import 'package:client/bottom_navigation.dart';
import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  double _opacity = 0.0;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 1), () {
      setState(() {
        _opacity = 1.0;
      });
    });
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) async {
      // var loggedIn = await SharedPrefsHelper.getBool('loggedIn');
      if (mounted) {
        Future.delayed(const Duration(seconds: 3), () {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context)=> const BottomNavigation()));
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedOpacity(
        opacity: _opacity,
        duration: const Duration(seconds: 1),
        child: Center(
          child: Image.asset(
           "assets/images/sunstar_logo.jpeg",
            height: 200,
            width: 200,
          ),
        ),
      ),
    );
  }
}
