
class UserProfile {
  String? message;
  bool? ok;
  UserModel? data;

  UserProfile({this.message, this.ok, this.data});

  UserProfile.fromJson(Map<String, dynamic> json) {
    message = json["message"];
    ok = json["ok"];
    data = json["data"] == null ? null : UserModel.fromJson(json["data"]);
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["message"] = message;
    data["ok"] = ok;
    // if(data != null) {
    //   data["data"] = data?.toJson();
    // }
    return data;
  }
}

class UserModel {
  String? id;
  String? username;
  String? role;
  String? mobileNumber;
  String? userid;
  bool? active;
  List<Orders>? orders;
  List<Cart>? cart;
  int? v;
  String? profileImage;
  List<DeliveryAddress>? deliveryAddress;

  UserModel({this.id, this.username, this.role, this.mobileNumber, this.userid, this.active, this.orders, this.cart, this.v, this.profileImage, this.deliveryAddress});

  UserModel.fromJson(Map<String, dynamic> json) {
    id = json["_id"];
    username = json["username"];
    role = json["role"];
    mobileNumber = json["mobileNumber"];
    userid = json["userid"];
    active = json["active"];
    orders = json["orders"] == null ? null : (json["orders"] as List).map((e) => Orders.fromJson(e)).toList();
    cart = json["cart"] == null ? null : (json["cart"] as List).map((e) => Cart.fromJson(e)).toList();
    v = json["__v"];
    profileImage = json["profileImage"];
    deliveryAddress = json["deliveryAddress"] == null ? null : (json["deliveryAddress"] as List).map((e) => DeliveryAddress.fromJson(e)).toList();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["_id"] = id;
    data["username"] = username;
    data["role"] = role;
    data["mobileNumber"] = mobileNumber;
    data["userid"] = userid;
    data["active"] = active;
    if(orders != null) {
      data["orders"] = orders?.map((e) => e.toJson()).toList();
    }
    if(cart != null) {
      data["cart"] = cart?.map((e) => e.toJson()).toList();
    }
    data["__v"] = v;
    data["profileImage"] = profileImage;
    if(deliveryAddress != null) {
      data["deliveryAddress"] = deliveryAddress?.map((e) => e.toJson()).toList();
    }
    return data;
  }
}

class DeliveryAddress {
  TagName? address;
  String? tag;
  String? id;

  DeliveryAddress({this.address, this.tag, this.id});

  DeliveryAddress.fromJson(Map<String, dynamic> json) {
    address = json["address"] == null ? null : TagName.fromJson(json["address"]);
    tag = json["tag"];
    id = json["_id"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if(address != null) {
      data["address"] = address?.toJson();
    }
    data["tag"] = tag;
    data["_id"] = id;
    return data;
  }
}

class TagName {
  String? flatNumber;
  String? area;
  String? nearbyLandmark;
  String? receiverName;
  String? receiverMobileNumber;

  TagName({this.flatNumber, this.area, this.nearbyLandmark, this.receiverName, this.receiverMobileNumber});

  TagName.fromJson(Map<String, dynamic> json) {
    flatNumber = json["flatNumber"];
    area = json["area"];
    nearbyLandmark = json["nearbyLandmark"];
    receiverName = json["receiverName"];
    receiverMobileNumber = json["receiverMobileNumber"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["flatNumber"] = flatNumber;
    data["area"] = area;
    data["nearbyLandmark"] = nearbyLandmark;
    data["receiverName"] = receiverName;
    data["receiverMobileNumber"] = receiverMobileNumber;
    return data;
  }
}

class Cart {
  String? productId;
  int? quantity;
  String? id;

  Cart({this.productId, this.quantity, this.id});

  Cart.fromJson(Map<String, dynamic> json) {
    productId = json["productId"];
    quantity = json["quantity"];
    id = json["_id"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["productId"] = productId;
    data["quantity"] = quantity;
    data["_id"] = id;
    return data;
  }
}

class Orders {
  String? id;
  String? orderId;
  String? status;
  int? grandTotal;
  List<Products>? products;

  Orders({this.id, this.orderId, this.status, this.grandTotal, this.products});

  Orders.fromJson(Map<String, dynamic> json) {
    id = json["_id"];
    orderId = json["orderId"];
    status = json["status"];
    grandTotal = json["grandTotal"];
    products = json["products"] == null ? null : (json["products"] as List).map((e) => Products.fromJson(e)).toList();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["_id"] = id;
    data["orderId"] = orderId;
    data["status"] = status;
    data["grandTotal"] = grandTotal;
    if(products != null) {
      data["products"] = products?.map((e) => e.toJson()).toList();
    }
    return data;
  }
}

class Products {
  ProductId? productId;
  int? quantity;
  String? id;

  Products({this.productId, this.quantity, this.id});

  Products.fromJson(Map<String, dynamic> json) {
    productId = json["productId"] == null ? null : ProductId.fromJson(json["productId"]);
    quantity = json["quantity"];
    id = json["_id"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if(productId != null) {
      data["productId"] = productId?.toJson();
    }
    data["quantity"] = quantity;
    data["_id"] = id;
    return data;
  }
}

class ProductId {
  String? id;
  String? productName;
  String? productCode;
  int? customerPrice;

  ProductId({this.id, this.productName, this.productCode, this.customerPrice});

  ProductId.fromJson(Map<String, dynamic> json) {
    id = json["_id"];
    productName = json["productName"];
    productCode = json["productCode"];
    customerPrice = json["customerPrice"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["_id"] = id;
    data["productName"] = productName;
    data["productCode"] = productCode;
    data["customerPrice"] = customerPrice;
    return data;
  }
}