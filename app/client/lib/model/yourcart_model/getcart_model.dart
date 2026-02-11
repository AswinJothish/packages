
//get cart item model

import '../../contants/config.dart';


class GetCartItem {
  int? status;
  List<GetCart>? cart;

  GetCartItem({this.status, this.cart});

  GetCartItem.fromJson(Map<String, dynamic> json) {
    status = json["status"];
    cart = json["cart"] == null ? null : (json["cart"] as List).map((e) => GetCart.fromJson(e)).toList();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["status"] = status;
    if(cart != null) {
      data["cart"] = cart?.map((e) => e.toJson()).toList();
    }
    return data;
  }
}

class GetCart {
  ProductId? productId;
  int? quantity;
  String? id;

  GetCart({this.productId, this.quantity, this.id});

  GetCart.fromJson(Map<String, dynamic> json) {
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
  List<String>? productImages;
  int? customerPrice;
  int? stock;
  int? dealerPrice;
  String? brand;
  int? strikePrice;
  List<Offers>? offers;

  ProductId({this.id, this.productName, this.productCode, this.productImages, this.customerPrice,this.dealerPrice, this.stock, this.brand, this.strikePrice, this.offers});

  ProductId.fromJson(Map<String, dynamic> json) {
    id = json["_id"];
    productName = json["productName"];
    productCode = json["productCode"];
    productImages = json["productImages"] == null ? null : List<String>.from(json["productImages"]);
    customerPrice = json["customerPrice"];
    dealerPrice = json["dealerPrice"];
    stock = json["stock"];
    brand = json["brand"];
    strikePrice = json["strikePrice"];
    offers = json["offers"] == null ? null : (json["offers"] as List).map((e) => Offers.fromJson(e)).toList();
  }


  // Getter to return the first image URL with the full path
  String get fullImageUrl {
    if (productImages != null && productImages!.isNotEmpty) {
      return '${AppConfig.imageUrl}${productImages![0]}';
    } else {
      return '${AppConfig.imageUrl}admin/files/view?key=default_image/';
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["_id"] = id;
    data["productName"] = productName;
    data["productCode"] = productCode;
    if(productImages != null) {
      data["productImages"] = productImages;
    }
    data["customerPrice"] = customerPrice;
    data["dealerPrice"] = dealerPrice;
    data["stock"] = stock;
    data["brand"] = brand;
    data["strikePrice"] = strikePrice;
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



