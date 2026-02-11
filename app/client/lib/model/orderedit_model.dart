import '../contants/config.dart';

class OrderEditModel {
  String? message;
  bool? ok;
  Order? order;

  OrderEditModel({this.message, this.ok, this.order});

  OrderEditModel.fromJson(Map<String, dynamic> json) {
    message = json['message'];
    ok = json['ok'];
    order = json['order'] != null ? Order.fromJson(json['order']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['message'] = message;
    data['ok'] = ok;
    if (order != null) {
      data['order'] = order!.toJson();
    }
    return data;
  }
}

class Order {
  String? sId;
  String? orderedBy;
  String? orderId;
  CustomerId? customerId;
  String? orderDate;
  DeliveryAddress? deliveryAddress;
  String? status;
  int? deliveryCharges;
  int? grandTotal;
  List<ProductsQ>? products;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? editedDate;
  List<Payment>? payment;
  List<PaymentDetails>? paymentDetails;

  Order(
      {this.sId,
        this.orderedBy,
        this.orderId,
        this.customerId,
        this.orderDate,
        this.deliveryAddress,
        this.status,
        this.deliveryCharges,
        this.grandTotal,
        this.products,
        this.createdAt,
        this.updatedAt,
        this.iV,
        this.editedDate,
        this.payment,
        this.paymentDetails
        });

  Order.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    orderedBy = json['orderedBy'];
    orderId = json['orderId'];
    customerId = json['customerId'] != null
        ? CustomerId.fromJson(json['customerId'])
        : null;
    orderDate = json['orderDate'];
    deliveryAddress = json['deliveryAddress'] != null
        ? DeliveryAddress.fromJson(json['deliveryAddress'])
        : null;
    status = json['status'];
    deliveryCharges = json['deliveryCharges'];
    grandTotal = json['grandTotal'];
    if (json['products'] != null) {
      products = <ProductsQ>[];
      json['products'].forEach((v) {
        products!.add(ProductsQ.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    editedDate = json["EditedDate"];
    payment = json["payment"] == null ? null : (json["payment"] as List).map((e) => Payment.fromJson(e)).toList();
    paymentDetails = json["paymentDetails"] == null ? null : (json["paymentDetails"] as List).map((e) => PaymentDetails.fromJson(e)).toList();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['orderedBy'] = orderedBy;
    data['orderId'] = orderId;
    if (customerId != null) {
      data['customerId'] = customerId!.toJson();
    }
    data['orderDate'] = orderDate;
    if (deliveryAddress != null) {
      data['deliveryAddress'] = deliveryAddress!.toJson();
    }
    data['status'] = status;
    data['deliveryCharges'] = deliveryCharges;
    data['grandTotal'] = grandTotal;
    if (products != null) {
      data['products'] = products!.map((v) => v.toJson()).toList();
    }
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['__v'] = iV;
    data["EditedDate"] = editedDate;
    if(payment != null) {
      data["payment"] = payment?.map((e) => e.toJson()).toList();
    }
    if(paymentDetails != null) {
      data["paymentDetails"] = paymentDetails?.map((e) => e.toJson()).toList();
    }
    return data;
  }
}

class PaymentDetails {
  String? date;
  dynamic paymentImage;
  dynamic transactionId;
  String? mode;
  int? paidAmount;
  int? balanceAmount;
  String? id;
  String? createdAt;
  String? updatedAt;

  PaymentDetails({this.date, this.paymentImage, this.transactionId, this.mode, this.paidAmount, this.balanceAmount, this.id, this.createdAt, this.updatedAt});

  PaymentDetails.fromJson(Map<String, dynamic> json) {
    date = json["date"];
    paymentImage = json["paymentImage"];
    transactionId = json["transactionId"];
    mode = json["mode"];
    paidAmount = json["paidAmount"];
    balanceAmount = json["balanceAmount"];
    id = json["_id"];
    createdAt = json["createdAt"];
    updatedAt = json["updatedAt"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["date"] = date;
    data["paymentImage"] = paymentImage;
    data["transactionId"] = transactionId;
    data["mode"] = mode;
    data["paidAmount"] = paidAmount;
    data["balanceAmount"] = balanceAmount;
    data["_id"] = id;
    data["createdAt"] = createdAt;
    data["updatedAt"] = updatedAt;
    return data;
  }
}

class Payment {
  String? paymentImage;
  String? transactionId;
  dynamic cash;
  String? verified;
  String? id;

  Payment({this.paymentImage, this.transactionId, this.cash, this.verified, this.id});

  Payment.fromJson(Map<String, dynamic> json) {
    paymentImage = json["paymentImage"];
    transactionId = json["transactionId"];
    cash = json["cash"];
    verified = json["verified"];
    id = json["_id"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["paymentImage"] = paymentImage;
    data["transactionId"] = transactionId;
    data["cash"] = cash;
    data["verified"] = verified;
    data["_id"] = id;
    return data;
  }
}

class CustomerId {
  String? sId;
  String? username;
  String? mobileNumber;

  CustomerId({this.sId, this.username, this.mobileNumber});

  CustomerId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    username = json['username'];
    mobileNumber = json['mobileNumber'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['username'] = username;
    data['mobileNumber'] = mobileNumber;
    return data;
  }
}

class DeliveryAddress {
  Home? home;

  DeliveryAddress({this.home});

  DeliveryAddress.fromJson(Map<String, dynamic> json) {
    home = json['home'] != null ? Home.fromJson(json['home']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (home != null) {
      data['home'] = home!.toJson();
    }
    return data;
  }
}

class Home {
  String? flatNumber;
  String? area;
  String? nearbyLandmark;
  String? receiverName;
  String? receiverMobileNumber;

  Home(
      {this.flatNumber,
        this.area,
        this.nearbyLandmark,
        this.receiverName,
        this.receiverMobileNumber});

  Home.fromJson(Map<String, dynamic> json) {
    flatNumber = json['flatNumber'];
    area = json['area'];
    nearbyLandmark = json['nearbyLandmark'];
    receiverName = json['receiverName'];
    receiverMobileNumber = json['receiverMobileNumber'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['flatNumber'] = flatNumber;
    data['area'] = area;
    data['nearbyLandmark'] = nearbyLandmark;
    data['receiverName'] = receiverName;
    data['receiverMobileNumber'] = receiverMobileNumber;
    return data;
  }
}

class ProductsQ {
  ProductIdmodel? productId;
  int? quantity;
  String? sId;

  ProductsQ({this.productId, this.quantity, this.sId});

  ProductsQ.fromJson(Map<String, dynamic> json) {
    productId = json['productId'] != null
        ? ProductIdmodel.fromJson(json['productId'])
        : null;
    quantity = json['quantity'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (productId != null) {
      data['productId'] = productId!.toJson();
    }
    data['quantity'] = quantity;
    data['_id'] = sId;
    return data;
  }
}

class ProductIdmodel {
  String? sId;
  String? productName;
  String? productCode;
  List<String>? productImages;
  int? customerPrice;
  int? dealerPrice;
  String? brand;
  int? strikePrice;
  List<Offers>? offers;

  ProductIdmodel(
      {this.sId,
        this.productName,
        this.productCode,
        this.productImages,
        this.customerPrice,
        this.dealerPrice,
        this.brand,
        this.strikePrice,
        this.offers
      });

  ProductIdmodel.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    productName = json['productName'];
    productCode = json['productCode'];
    productImages = json['productImages'].cast<String>();
    customerPrice = json['customerPrice'];
    dealerPrice = json['dealerPrice'];
    brand = json['brand'];
    strikePrice = json['strikePrice'];
    offers = json["offers"] == null ? null : (json["offers"] as List).map((e) => Offers.fromJson(e)).toList();
  }

  String get fullImageUrl {
    if (productImages != null && productImages!.isNotEmpty) {
      return '${AppConfig.imageUrl}${productImages![0]}';
    } else {
      return '${AppConfig.imageUrl}admin/files/view?key=default_image/';
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['productName'] = productName;
    data['productCode'] = productCode;
    data['productImages'] = productImages;
    data['customerPrice'] = customerPrice;
    data['dealerPrice'] = dealerPrice;
    data['brand'] = brand;
    data['strikePrice'] = strikePrice;
    if(offers != null) {
      data["offers"] = offers?.map((e) => e.toJson()).toList();
    }
    return data;
  }
}

class Offers {
  int? from;
  int? to;
  int? customerPrice;
  int? dealerPrice;

  Offers({this.from, this.to, this.customerPrice, this.dealerPrice});

  Offers.fromJson(Map<String, dynamic> json) {
    from = json["from"];
    to = json["to"];
    customerPrice = json["customerPrice"];
    dealerPrice = json["dealerPrice"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["from"] = from;
    data["to"] = to;
    data["customerPrice"] = customerPrice;
    data["dealerPrice"] = dealerPrice;
    return data;
  }
}

