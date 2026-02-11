import '../contants/config.dart';

class OrderModel {
  String? message;
  List<Orders>? orders;
  bool? ok;

  OrderModel({this.message, this.orders, this.ok});

  OrderModel.fromJson(Map<String, dynamic> json) {
    message = json['message'];
    if (json['orders'] != null) {
      orders = <Orders>[];
      json['orders'].forEach((v) {
        orders!.add(Orders.fromJson(v));
      });
    }
    ok = json['ok'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['message'] = message;
    if (orders != null) {
      data['orders'] = orders!.map((v) => v.toJson()).toList();
    }
    data['ok'] = ok;
    return data;
  }
}

class Orders {
  String? sId;
  String? orderedBy;
  String? orderId;
  String? customerId;
  String? orderDate;
  DeliveryAddress? deliveryAddress;
  String? status;
  int? deliveryCharges;
  int? grandTotal;
  List<ProductsTQ>? products;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? transactionId;
  String? paymentImage;

  Orders(
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
        this.transactionId,
        this.paymentImage});

  Orders.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    orderedBy = json['orderedBy'];
    orderId = json['orderId'];
    customerId = json['customerId'];
    orderDate = json['orderDate'];
    deliveryAddress = json['deliveryAddress'] != null
        ? DeliveryAddress.fromJson(json['deliveryAddress'])
        : null;
    status = json['status'];
    deliveryCharges = json['deliveryCharges'];
    grandTotal = json['grandTotal'];
    if (json['products'] != null) {
      products = <ProductsTQ>[];
      json['products'].forEach((v) {
        products!.add(ProductsTQ.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    transactionId = json['transactionId'];
    paymentImage = json['paymentImage'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['orderedBy'] = orderedBy;
    data['orderId'] = orderId;
    data['customerId'] = customerId;
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
    data['transactionId'] = transactionId;
    data['paymentImage'] = paymentImage;
    return data;
  }
}

class DeliveryAddress {
  tagName? home;

  DeliveryAddress({this.home});

  DeliveryAddress.fromJson(Map<String, dynamic> json) {
    home = json['home'] != null ? tagName.fromJson(json['home']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (home != null) {
      data['home'] = home!.toJson();
    }
    return data;
  }
}

class tagName {
  String? flatNumber;
  String? area;
  String? nearbyLandmark;
  String? receiverName;
  String? receiverMobileNumber;

  tagName(
      {this.flatNumber,
        this.area,
        this.nearbyLandmark,
        this.receiverName,
        this.receiverMobileNumber});

  tagName.fromJson(Map<String, dynamic> json) {
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

class ProductsTQ {
  ProductId? productId;
  int? quantity;
  String? sId;

  ProductsTQ({this.productId, this.quantity, this.sId});

  ProductsTQ.fromJson(Map<String, dynamic> json) {
    productId = json['productId'] != null
        ? ProductId.fromJson(json['productId'])
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

class ProductId {
  String? sId;
  String? productName;
  List<String>? productImages;
  int? customerPrice;
  int? dealerPrice;

  ProductId(
      {this.sId, this.productName, this.productImages, this.customerPrice,this.dealerPrice});

  ProductId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    productName = json['productName'];
    productImages = json['productImages'].cast<String>();
    customerPrice = json['customerPrice'];
    dealerPrice =json ['dealerPrice'];
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
    data['productImages'] = productImages;
    data['customerPrice'] = customerPrice;
    data['dealerPrice'] = dealerPrice;
    return data;
  }
}
