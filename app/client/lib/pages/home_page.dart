import 'package:client/model/user_model.dart';
import 'package:client/pages/productViewall_page.dart';
import 'package:client/pages/search_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../api_services/product_api.dart';
import '../api_services/profile_user_api.dart';
import '../api_services/yourcart_api.dart';
import '../contants/pref.dart';
import '../model/categories_model.dart';
import '../model/get_address_model.dart';
import '../model/product_model.dart' as product_model;
import 'addcart_page.dart';
import 'categories/categoryproduct_screen.dart';
import 'login_screen.dart';


class HomePage extends StatefulWidget {

  const HomePage({super.key});

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  UserProfile? user;
  UserApiService userApiService = UserApiService();
  final ProductServices _productServices = ProductServices();
  Future<List<product_model.Products>> _productsFuture = Future.value([]);
  Future<List<product_model.Products>> _newProductsFuture = Future.value([]);
  List<CategoryData> categories = [];
  bool isLoading = true;
  String errorMessage = '';
  String? selectedAddress;
  GetAddressModel? addressModel;
  String role='';
  late double customerPrice;
  late double dealerPrice;
  bool isLoggedIn = true;

  String _getUserDisplayName() {
    if (user?.data == null) return 'Welcome';
    return user!.data?.username ??
        user!.data?.mobileNumber ??
        'Welcome';
  }

  bool _hasValidAddress() {
    return addressModel?.deliveryAddress != null &&
        addressModel!.deliveryAddress!.isNotEmpty &&
        addressModel!.deliveryAddress![0].address != null;
  }

  String _getFormattedAddress() {
    if (!_hasValidAddress()) return '';

    final address = addressModel!.deliveryAddress![0].address!;
    final flatNumber = address.flatNumber ?? '';
    final area = address.area ?? '';

    if (flatNumber.isEmpty && area.isEmpty) return '';
    if (flatNumber.isEmpty) return area;
    if (area.isEmpty) return flatNumber;

    return "$flatNumber, $area";
  }

  @override
  void initState() {
    super.initState();
    _initializeData();
  }



  Future<void> _initializeData() async {
    if (!mounted) return;
    setState(() {
      isLoading = true;
    });
    bool login = await SharedPrefsHelper.getBool('loggedIn');
    if(login == null) {
      await SharedPrefsHelper.setBool('loggedIn', false);
      if (!mounted) return;
      Get.offAll(() => const LoginScreen());
      return;
    }

    try {
      List<product_model.Products> allProducts = await _productServices.fetchAllProducts();

      List<product_model.Products> sortedNewProducts = List.from(allProducts);
      sortedNewProducts.sort((a, b) {

        DateTime dateA = DateTime.parse(a.createdAt ?? DateTime.now().toIso8601String());
        DateTime dateB = DateTime.parse(b.createdAt ?? DateTime.now().toIso8601String());
        return dateB.compareTo(dateA); // Sort in descending order (newest first)
      });
      _productsFuture = Future.value(allProducts);
      _newProductsFuture = Future.value(sortedNewProducts);
      role = await  SharedPrefsHelper.getString('role')??'';
      await Future.wait([
        fetchUserDetail(),
        fetchGetAddress(),
        _fetchCategories(),
      ]);
    } catch (e) {
      print('Error initializing data: $e');
      setState(() {
        errorMessage = e.toString();
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _fetchCategories() async {
    try {
      final CategoryModel response = await _productServices.fetchCategories();

      if (response.data != null && response.data!.isNotEmpty) {
        setState(() {
          // categories = response.data!.expand((categoryData) => categoryData.category!).toList();
          categories = response.data??[];
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  Future<void> fetchUserDetail() async {
    String? userId = await SharedPrefsHelper.getString('userId');
    if (userId != null) {
      try {
        final value = await userApiService.getUserById(userId);
        setState(() {
          user = value;
        });
        if (user?.data?.username != null) {
          await SharedPrefsHelper.setString('userName', user!.data!.username!);
        }
      } catch (e) {
        print('Error fetching user details: $e');
      }
    }
  }

  Future<void> fetchGetAddress() async {
    String? userId = await SharedPrefsHelper.getString('userId');
    if (userId != null) {
      try {
        var value = await YourcartApi().getAddress(userId);
        setState(() {
          addressModel = value;
        });
      } catch (e) {
        print('Error fetching address: $e');
        setState(() {
          addressModel = null;
        });
      }
    }
  }

  DateTime? _lastPressedAt;

  Future<bool> _onWillPop() async {
    if (_lastPressedAt == null ||
        DateTime.now().difference(_lastPressedAt!) > const Duration(seconds: 2)) {
      // First press or more than 2 seconds since last press
      _lastPressedAt = DateTime.now();

      return await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(
            'Exit App',
            style: GoogleFonts.roboto(
              fontWeight: FontWeight.w500,
            ),
          ),
          content: Text(
            'Are you sure you want to exit?',
            style: GoogleFonts.roboto(),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(
                'No',
                style: GoogleFonts.roboto(
                  color: const Color(0xFF1F5DA5),
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(true);
                SystemNavigator.pop(); // This will close the app
              },
              child: Text(
                'Yes',
                style: GoogleFonts.roboto(
                  color: const Color(0xFF1F5DA5),
                ),
              ),
            ),
          ],
        ),
      ) ?? false;
    }
    return true;
  }



  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F6F6),
        appBar: AppBar(toolbarHeight: 0.1,),
        body: isLoading? const Center(
          child: CircularProgressIndicator(),
        ):SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(5.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                _buildHeader(context),
                _buildSearchField(),
                Card(child: Image.asset("assets/images/Rectangle1333.png")),
                _buildCategoriesSection(context),
                _buildProductSection("Our Products", _productsFuture,() {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ProductviewallPage(isAscending: true,),
                    ),
                  );


                },),
                _buildProductSection("New Products", _newProductsFuture,() {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ProductviewallPage(isAscending: false,),
                    ),
                  );
                },),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _getUserDisplayName(),
                style: GoogleFonts.lato(
                  textStyle: Theme.of(context).textTheme.titleLarge,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF121212),
                ),
              ),
              if (_hasValidAddress())
                Text(
                  _getFormattedAddress(),
                  style: GoogleFonts.roboto(
                    textStyle: Theme.of(context).textTheme.titleSmall,
                    color: const Color(0xFF121212),
                  ),
                ),
            ],
          ),
          const Spacer(),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => AddcartPage()),
              );
            },
            child: Container(
              width: 39,
              height: 39,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1F5DA5), Color(0xFF184282)],
                ),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.shopping_cart_outlined,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return Container(
      margin: const EdgeInsets.only(top: 20, bottom: 20),
      width: double.infinity,
      height: 55,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
      ),
      child: TextFormField(
        readOnly: true, // Prevents the keyboard from opening
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => SearchPage()),
          );
        },
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: "Search",
          hintStyle: TextStyle(
            fontSize: 17,
            color: Colors.black.withOpacity(0.5),
          ),
          prefixIcon: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Image.asset(
              "assets/images/searchicon.png",
              width: 20,
              height: 20,
              fit: BoxFit.contain,
            ),
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 15.0), // Center the text vertically
        ),
        style: TextStyle(
          fontSize: 17,
          color: Colors.black,
        ),
      ),
    );
  }

  Widget _buildCategoriesSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Categories',
            style: GoogleFonts.roboto(
              textStyle: Theme.of(context).textTheme.titleLarge,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF121212),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 36,
            child: ListView.builder(
              itemCount: categories.length,
              scrollDirection: Axis.horizontal,
              itemBuilder: (context, index) {
                final category = categories[index];
                return GestureDetector(
                  onTap: (){
                    setState(() {
                      Navigator.push(context, MaterialPageRoute(builder: (context)=>CategoryproductScreen(categoryName: category.categoryName??'',)));
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.only(left: 8, right: 8),
                    // height: 36,
                    margin: const EdgeInsets.symmetric(horizontal: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: Center(
                      child: Text(
                        category.categoryName??'',
                        style: TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 14.0,
                          fontWeight: FontWeight.w400,
                          color: Colors.black54
                        ),
                        textAlign: TextAlign.left, // Align text to the left
                      ),
                    ),
                  ),
                );
              },
            ),
          )

        ],
      ),
    );
  }

  Widget _buildCategoryButton(BuildContext context, String title, Widget screen) {
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
      ),
      child: TextButton(
        style: TextButton.styleFrom(padding: EdgeInsets.zero),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => screen),
          );
        },
        child: Text(
          title,
          style: GoogleFonts.lato(
            textStyle: Theme.of(context).textTheme.titleSmall,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF000B49),
          ),
        ),
      ),
    );
  }

  Widget _buildProductSection(String title, Future<List<product_model.Products>> productsFuture,VoidCallback onTap) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(10.0),
          child: Row(
            children: [
              Text(
                title,
                style: GoogleFonts.roboto(
                  textStyle: Theme.of(context).textTheme.titleLarge,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF121212),
                ),
              ),
              const Spacer(),
              InkWell(
                onTap:onTap ,
                child: Text(
                  "View all",
                  style: GoogleFonts.lato(
                    textStyle: Theme.of(context).textTheme.titleSmall,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF4E505B),
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 200,
          child: FutureBuilder<List<product_model.Products>>(
            future: productsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return _buildShimmerLoading();
              } else if (snapshot.hasError) {
                return const Center(child: Text('Failed to load products'));
              } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Center(child: Text('No products found'));
              } else {
                final products = snapshot.data!;
                return ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: products.length > 10 ? 11 : products.length,
                  itemBuilder: (context, index) {
                    final product = products[index];
                    return _buildProductItem(product);
                  },
                );
              }
            },
          ),
        ),
      ],
    );
  }


  // Shimmer loading for product cards
  Widget _buildShimmerLoading() {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      itemCount: 5,
      itemBuilder: (context, index) {
        return Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(
            width: 138,
            height: 186,
            margin: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 98,
                  width: 77,
                  color: Colors.grey,
                ),
                const SizedBox(height: 6),
                Container(
                  height: 16,
                  width: 100,
                  color: Colors.grey,
                ),
                const SizedBox(height: 6),
                Container(
                  height: 16,
                  width: 60,
                  color: Colors.grey,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProductItem(product_model.Products product) {
    return InkWell(
      onTap: () {
        Navigator.pushNamed(
          context,
          '/productdetailPage',
          arguments: product.id,
        );
      },
      child: Container(
        width: 138,
        height: 186,
        margin: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: SizedBox(
                height: 98,
                width: 77,
                child: Image.network(
                  product.fullImageUrl,
                  // product.productImages![0],
                  fit: BoxFit.contain,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.only(left: 8.0),
              child: Text(
                product.productName ?? '',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.roboto(
                  textStyle: Theme.of(context).textTheme.titleMedium,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF090F47),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.only(left: 8.0),
              child: Text(
                "Rs. ${isLoggedIn ? (role == 'dealer' ? product.dealerPrice : product.customerPrice) : product.customerPrice}",
                style: GoogleFonts.roboto(
                  textStyle: Theme.of(context).textTheme.titleMedium,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF090F47),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.only(left: 8.0),
              child: Row(
                children: [
                  Expanded(
                    child: FittedBox( // Added FittedBox to adjust text size dynamically
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Row(
                        children: [
                          Text(
                            "Inclusive GST",
                            style: const TextStyle(
                              color: Color(0xFF0C6C03),
                              fontSize: 10,
                            ),
                          ),
                          SizedBox(width: 5,),
                          Text(
                            "₹ ${product.strikePrice}",
                            style: const TextStyle(
                              color: Color(0xFF757575),
                              fontSize: 12,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                      ),

                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      )

    );
  }
}
