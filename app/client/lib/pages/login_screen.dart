// import 'dart:io';
// import 'package:client/bottom_navigation.dart';
// import 'package:client/pages/user.dart';
// import 'package:firebase_messaging/firebase_messaging.dart';
// import 'package:flutter/material.dart';
// import 'package:fluttertoast/fluttertoast.dart';
// import 'package:get/get_core/src/get_main.dart';
// import 'package:otpless_flutter/otpless_flutter.dart';
//
// import '../common/dio_client.dart';
// import '../contants/pref.dart';
// import '../controller/auth_controller.dart';
//
// class LoginScreen extends StatefulWidget {
//   const LoginScreen({super.key});
//
//   @override
//   State<LoginScreen> createState() => _LoginScreenState();
// }
//
// class _LoginScreenState extends State<LoginScreen> {
//
//
//   final _otplessFlutterPlugin = Otpless();
//   final Map<String, String> _otplessArgs = {
//     'appId': "NVVXOPIPQXK389F1PHAB",
//     'crossButtonHidden': "true",
//   };
//
//   var message = "";
//   String fcmToken = "";
//
//   final AuthRepository _authRepository = AuthRepository();
//
//
//   @override
//   void initState() {
//     super.initState();
//     // WidgetsBinding.instance.addPostFrameCallback((timeStamp) async {
//     //   await startOtpLess();
//     // });
//     WidgetsBinding.instance.addPostFrameCallback((timeStamp) async {
//       var loggedIn = await SharedPrefsHelper.getBool('loggedIn');
//       if (loggedIn == true && mounted) {
//         Navigator.pushReplacement(
//           context,
//           MaterialPageRoute(builder: (context) => BottomNavigation()),
//         );
//         return;
//       } else {
//         await startOtpLess();
//       }
//     });
//   }
//
//
//
//   Future<void> startOtpLess() async {
//     try {
//       await _otplessFlutterPlugin.openLoginPage((result) async {
//         print("result values are: $result");
//         if (result['data'] != null) {
//           final authToken = result['data']['token'];
//           message = "token: $authToken";
//           String phoneNumber = result['data']['identities'][0]['identityValue'].toString().substring(2);
//           User user = await _authRepository.login(phoneNumber);
//           await SharedPrefsHelper.setString("token", user.data.token);
//           await SharedPrefsHelper.setBool('loggedIn', true);
//           await SharedPrefsHelper.setString('userId', user.data.id);
//           await SharedPrefsHelper.setString('phone', user.data.phoneNumber);
//           await ApiClient.updateToken(user.data.token);
//
//
//           // Perform your login logic and navigate as needed
//           // For example:
//           // if (Platform.isAndroid) {
//           //   fcmToken = await FirebaseMessaging.instance.getToken() ?? "";
//           // } else if (Platform.isIOS) {
//           //   fcmToken = await FirebaseMessaging.instance.getAPNSToken() ?? "";
//           // }
//           // await _authRepository.updateFcm(fcmToken, phoneNumber);
//
//           // Navigate to BottomNavigation screen
//           if (mounted) {
//             Navigator.pushReplacement(
//               context,
//               MaterialPageRoute(builder: (context) => BottomNavigation()),
//             );
//           }
//         } else {
//           message = result['errorMessage'] ?? 'Unknown error';
//           if (context.mounted && message == "user cancelled") {
//             Navigator.pushReplacement(
//               context,
//               MaterialPageRoute(builder: (context) => LoginScreen()),
//             );
//           } else {
//             // Handle other errors or messages
//             print('Error: $message');
//           }
//         }
//       }, _otplessArgs);
//     } catch (e) {
//       // Handle any exceptions during the login process
//       print('Exception during Otpless login: $e');
//     }
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: Center(
//         child: CircularProgressIndicator(), // Show a loading indicator while logging in
//       ),
//     );
//   }
// }
//


import 'dart:io';
import 'package:client/bottom_navigation.dart';
import 'package:client/pages/user.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:otpless_flutter/otpless_flutter.dart';

import '../common/dio_client.dart';
import '../contants/pref.dart';
import '../controller/auth_controller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {


  final _otplessFlutterPlugin = Otpless();
  final Map<String, String> _otplessArgs = {
    'appId': "NVVXOPIPQXK389F1PHAB",
    'crossButtonHidden': "true",
  };

  var message = "";
  String fcmToken = "";

  final AuthRepository _authRepository = AuthRepository();



  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) async {
      var loggedIn = await SharedPrefsHelper.getBool('loggedIn');
      if (loggedIn == true && mounted) {
        await _navigateBasedOnRole();  // Navigate based on saved role
        return;
      } else {
        await startOtpLess();
      }
    });
  }

  // New method to handle role-based redirection
  Future<void> _navigateBasedOnRole() async {
    String? userRole = await SharedPrefsHelper.getString('role'); // Retrieve saved role
    if (userRole == 'customer') {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const BottomNavigation()),  // Navigate to customer dashboard
      );
    } else if (userRole == 'dealer') {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const BottomNavigation()),  // Navigate to dealer-specific screen
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),  // Default login page if no role
      );
    }
  }

  Future<void> startOtpLess() async {
    try {
      await _otplessFlutterPlugin.openLoginPage((result) async {
        print("result values are: $result");
        if (result['data'] != null) {
          final authToken = result['data']['token'];
          message = "token: $authToken";
          String phoneNumber = result['data']['identities'][0]['identityValue'].toString().substring(2);
          print("phone number: $phoneNumber");
          User user = await _authRepository.login(phoneNumber);
          await SharedPrefsHelper.setString("token", user.token??'');
          await SharedPrefsHelper.setBool('loggedIn', true);
          await SharedPrefsHelper.setString('userId', user.userData!.id??'');
          await SharedPrefsHelper.setString('userDataId', user.userData!.userid??'');
          await SharedPrefsHelper.setString('phone', user.userData!.mobileNumber??'');
          await SharedPrefsHelper.setString('role', user.userData!.role??''); // Save the role (customer or dealer)
          await ApiClient.updateToken(user.token??'');


          // Perform your login logic and navigate as needed
          // For example:
          // if (Platform.isAndroid) {
          //   fcmToken = await FirebaseMessaging.instance.getToken() ?? "";
          // } else if (Platform.isIOS) {
          //   fcmToken = await FirebaseMessaging.instance.getAPNSToken() ?? "";
          // }
          // await _authRepository.updateFcm(fcmToken, phoneNumber);

          // Navigate to BottomNavigation screen
          if (user.ok??false) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const BottomNavigation()),
            );
          }
        } else {
          message = result['errorMessage'] ?? 'Unknown error';
          if (context.mounted && message == "user cancelled") {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const LoginScreen()),
            );
          } else {
            // Handle other errors or messages
            print('Error: $message');
          }
        }
      }, _otplessArgs);
    } catch (e) {
      // Handle any exceptions during the login process
      print('Exception during Otpless login: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
