import 'dart:developer';
import 'dart:io'; // To handle FileImage if you're loading local images

import 'package:client/contants/config.dart';
import 'package:client/contants/pref.dart';
import 'package:client/model/user_model.dart';
import 'package:client/pages/editprofile_page.dart';
import 'package:client/pages/login_screen.dart';
import 'package:client/pages/manage_address_page.dart'; // Import Manage Address Page
import 'package:client/pages/order_page.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../api_services/profile_user_api.dart';
import '../bottom_navigation.dart';
import '../common/common.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  UserProfile? user;
  bool isLoading = true;
  String? userId;
  UserApiService userApiService = UserApiService();

  Future<void> fetchUserDetail() async {
    setState(() {
      isLoading = true;
      user = null;
    });
    String? userId = await SharedPrefsHelper.getString('userId');
    if (userId != null) {
      final value = await userApiService.getUserById(userId);
      setState(() {
        user = value;

        isLoading = false;
      });
      await SharedPrefsHelper.setString('userName', user!.data!.username ?? "");
    } else {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _loadDataWithTimeout() async {
    await Future.delayed(const Duration(seconds: 5)); // Timeout duration
    if (mounted && userId == null) {
      // Check if data failed to load
      setState(() {
        isLoading = false; // Stop shimmer effect after timeout
      });
    }
  }

  @override
  void initState() {
    super.initState();
    initialUsercheck();
    if (userId == null) {}
    _loadDataWithTimeout();
    fetchUserDetail();
  }

  initialUsercheck() async {
    userId = await SharedPrefsHelper.getString('userId');
    log("USERID:$userId");
  }


  DateTime? _lastPressedAt;

  Future<bool> _onWillPop() async {
    if (_lastPressedAt == null ||
        DateTime.now().difference(_lastPressedAt!) > const Duration(seconds: 2)) {
      _lastPressedAt = DateTime.now();

      // Instead of showing dialog, navigate to homepage
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (context) => const BottomNavigation(), // Replace with your HomePage widget
        ),
            (route) => false, // This removes all previous routes from the stack
      );

      return false; // Prevents the app from exiting
    }
    return false;
  }


  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F6F6),
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: const Color(0xFFF7F6F6),
          title: Text(
            "Profile",
            style: GoogleFonts.roboto(
              textStyle: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 18,
                color: Color(0xFF121212),
              ),
            ),
          ),
        ),
        body: userId == null
            ? isLoading
                ? Center(
                    child: Shimmer.fromColors(
                      baseColor: Colors.grey[300]!,
                      highlightColor: Colors.grey[100]!,
                      child: Column(
                        children: [
                          const SizedBox(height: 20),
                          CircleAvatar(
                            radius: 50,
                            backgroundColor:
                                Colors.grey[300], // Placeholder for image
                          ),
                          const SizedBox(height: 10),
                          Container(
                            width: 150,
                            height: 20,
                            color: Colors.grey[300], // Placeholder for name
                          ),
                          const SizedBox(height: 5),
                          Container(
                            width: 100,
                            height: 15,
                            color:
                                Colors.grey[300], // Placeholder for phone number
                          ),
                          const SizedBox(height: 20),
                          Container(
                            width: 150,
                            height: 50,
                            color: Colors.grey[300], // Placeholder for button
                          ),
                        ],
                      ),
                    ),
                  )
                : Center(
                    child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(15.0),
                        child: Column(
                          children: [
                            const SizedBox(height: 200,),
                            Text(
                              "Get access to your Orders",
                              style: GoogleFonts.roboto(
                                fontSize: 20,
                                fontWeight: FontWeight.normal,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),

                      Center(
                        child: Container(
                          width: 300,
                          height: 60,
                          padding: const EdgeInsets.symmetric(vertical: 15),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => const LoginScreen()));
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              padding: EdgeInsets.zero,
                            ),
                            child: const Text(
                              "Login",
                              style: TextStyle(
                                fontFamily: 'Satoshi',
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                height: 32.43 / 24,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        // TextButton(
                        //     onPressed: () {
                        //       Navigator.pushReplacement(
                        //           context,
                        //           MaterialPageRoute(
                        //               builder: (context) => LoginScreen()));
                        //     },
                        //     child: Text("Login")),
                      ),
                    ],
                  ))
            : isLoading
                ? Center(
                    child: Shimmer.fromColors(
                      baseColor: Colors.grey[300]!,
                      highlightColor: Colors.grey[100]!,
                      child: Column(
                        children: [
                          const SizedBox(height: 20),
                          CircleAvatar(
                            radius: 50,
                            backgroundColor:
                                Colors.grey[300], // Placeholder for image
                          ),
                          const SizedBox(height: 10),
                          Container(
                            width: 150,
                            height: 20,
                            color: Colors.grey[300], // Placeholder for name
                          ),
                          const SizedBox(height: 5),
                          Container(
                            width: 100,
                            height: 15,
                            color:
                                Colors.grey[300], // Placeholder for phone number
                          ),
                          const SizedBox(height: 20),
                          Container(
                            width: 150,
                            height: 50,
                            color: Colors.grey[300], // Placeholder for button
                          ),
                        ],
                      ),
                    ),
                  )
                : Column(
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundImage: user != null &&
                                user!.data?.profileImage != null
                            ? NetworkImage(
                                AppConfig.imageUrl + user!.data!.profileImage!)
                            : null,
                        child: user == null || user!.data?.profileImage == null
                            ? const Icon(Icons.person,
                                size: 60) // Default icon if no image
                            : null,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user != null && user!.data!.username!.isNotEmpty
                            ? user!.data?.username ?? ''
                            : user!.data?.userid ?? '',
                        style: const TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 16.0,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF161616),
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "+91",
                            style: GoogleFonts.inter(
                              textStyle: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFF161616),
                              ),
                            ),
                          ),
                          Text(
                            user?.data?.mobileNumber ?? '', // Handle null case
                            style: GoogleFonts.inter(
                              textStyle: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF161616),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      InkWell(
                        onTap: () {
                          if (user != null) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => EditprofilePage(
                                  userId: user!.data!.id ?? '',
                                  userName: user != null &&
                                          user!.data!.username!.isNotEmpty
                                      ? user!.data?.username
                                      : user!.data?.userid,
                                  mobileNumber: user!.data!.mobileNumber ?? '',
                                  profileImage: user!.data!.profileImage ?? '',
                                ),
                              ),
                            ).then((value) {
                              isLoading = true;
                              Future.delayed(const Duration(milliseconds: 1000),
                                  () {
                                setState(() {
                                  fetchUserDetail();
                                });
                              });
                            });
                          }
                        },
                        child: Container(
                          width: 44,
                          height: 44,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: const Icon(Icons.edit_outlined,
                              color: Color(0xFFFFFFFF)),
                        ),
                      ),
                      const SizedBox(height: 25),
                      const Divider(color: Color(0xFFEBEBEB), thickness: 1),
                      const SizedBox(height: 25),

                      customListTile(
                          text: 'Manage Address',
                          onTap: () {
                            Get.to(() => const ManageAddressPage());
                          },
                          icon: Icons.location_on_rounded,
                          image: null,
                          context: context),
                      customListTile(
                          text: 'Order History',
                          onTap: () {
                            Get.to(() => const OrderPage());
                          },
                          icon: null,
                          image: 'assets/images/orderhistoryicon.png',
                          context: context),
                      customListTile(
                          text: 'Delete Account',
                          onTap: () {
                            showDialog(
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  title: const Center(child: Text('Delete Account')),
                                  content: const Text(
                                      'Are you sure you want to delete your account?'),
                                  actions: [
                                    TextButton(
                                      onPressed: () async {
                                        String? userId =
                                            await SharedPrefsHelper.getString(
                                                'userId');
                                        if (userId != null) {
                                          var response = await UserApiService()
                                              .deleteUser(userId);
                                          if (response["ok"] == true) {
                                            await SharedPrefsHelper.setBool(
                                                'loggedIn', false);
                                            Navigator.pushAndRemoveUntil(
                                              context,
                                              MaterialPageRoute(
                                                  builder: (context) =>
                                                      const LoginScreen()),
                                              (route) => false,
                                            );
                                            Fluttertoast.showToast(
                                                msg: response["message"]);
                                          } else {
                                            Navigator.pop(context);
                                            Fluttertoast.showToast(
                                                msg: response["message"]);
                                          }
                                        }
                                      },
                                      child: const Text('Delete'),
                                    ),
                                    TextButton(
                                      onPressed: () {
                                        Navigator.of(context).pop();
                                      },
                                      child: const Text('Cancel'),
                                    ),
                                  ],
                                );
                              },
                              context: Get
                                  .context!, // Use GetX context if not inside a direct BuildContext
                            );
                          },
                          icon: Icons.logout,
                          image: null,
                          context: context),
                      customListTile(
                          text: 'Logout',
                          onTap: () {
                            showDialog(
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  title: const Center(child: Text('Logout')),
                                  content: const Column(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text('Are you sure you want to Logout?'),
                                    ],
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () async {
                                        await SharedPrefsHelper.clear();
                                        // await SharedPrefsHelper.setBool(
                                        //     'loggedIn', false);
                                        if (context.mounted) {
                                          Fluttertoast.showToast(
                                              msg: "Logged out Successfully");
                                          Navigator.pushAndRemoveUntil(
                                            context,
                                            MaterialPageRoute(
                                                builder: (context) =>
                                                    const LoginScreen()),
                                            (route) => false,
                                          );
                                        }
                                      },
                                      child: const Text('Logout'),
                                    ),
                                    TextButton(
                                      onPressed: () {
                                        Navigator.of(context).pop();
                                      },
                                      child: const Text('Cancel'),
                                    ),
                                  ],
                                );
                              },
                              context: Get
                                  .context!, // Use GetX context if not inside a direct BuildContext
                            );
                          },
                          icon: Icons.power_settings_new,
                          image: null,
                          context: context),
                      // customListTile(
                      //     text: 'Logout',
                      //     onTap: () async {
                      //       await SharedPrefsHelper.setBool('loggedIn', false);
                      //       Fluttertoast.showToast(msg: "Logged out Successfully");
                      //       Navigator.pushAndRemoveUntil(
                      //         context,
                      //         MaterialPageRoute(builder: (context) => LoginScreen()),
                      //         (route) => false,
                      //       );
                      //     },
                      //     icon: Icons.power_settings_new,
                      //     image: null,
                      //     context: context),

                      // Padding(
                      //   padding: const EdgeInsets.all(8.0),
                      //   child: Container(
                      //     width: 351,
                      //     height: 60,
                      //     padding: const EdgeInsets.symmetric(vertical: 15),
                      //     decoration: BoxDecoration(
                      //       gradient: const LinearGradient(
                      //         colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
                      //         begin: Alignment.topLeft,
                      //         end: Alignment.bottomRight,
                      //       ),
                      //       borderRadius: BorderRadius.circular(30),
                      //     ),
                      //     child: ElevatedButton(
                      //       onPressed: () async {
                      //         await SharedPrefsHelper.setBool('loggedIn', false);
                      //         Navigator.pushAndRemoveUntil(
                      //           context,
                      //           MaterialPageRoute(
                      //               builder: (context) => LoginScreen()),
                      //           (route) => false,
                      //         );
                      //         Fluttertoast.showToast(msg: "Logged out Successfully");
                      //       },
                      //       style: ElevatedButton.styleFrom(
                      //         backgroundColor: Colors.transparent,
                      //         shadowColor: Colors.transparent,
                      //         padding: EdgeInsets.zero,
                      //       ),
                      //       child: const Text(
                      //         "Logout",
                      //         style: TextStyle(
                      //           fontFamily: 'Satoshi',
                      //           fontSize: 24,
                      //           fontWeight: FontWeight.bold,
                      //           height: 1.35,
                      //           color: Colors.white,
                      //         ),
                      //       ),
                      //     ),
                      //   ),
                      // ),
                    ],
                  ),
      ),
    );
  }

  Padding customListTile(
      {String? image,
      IconData? icon,
      required VoidCallback onTap,
      required String text,
      required BuildContext context}) {
    return Padding(
      padding: const EdgeInsets.all(15.0),
      child: InkWell(
        onTap: onTap,
        child: Row(
          children: [
            if (image != null)
              Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage(image),
                  ),
                ),
              )
            else
              Icon(
                icon,
                color: const Color(0xFF4E505B),
              ),
            const SizedBox(width: 16),
            Text(
              text,
              style: GoogleFonts.roboto(
                textStyle: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold, // Make the header bold
                  color: Colors.black,
                ),
              ),
            ),
            const Spacer(),
            const Icon(Icons.arrow_forward_ios, size: 16),
          ],
        ),
      ),
    );
  }
}
