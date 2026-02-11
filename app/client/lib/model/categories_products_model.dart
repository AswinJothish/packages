
import 'package:client/model/product_model.dart';

import '../contants/config.dart';

class CategoryProductsModel {
  String? message;
  bool? ok;
  List<CategoryProductsData>? data;
  int? count;

  CategoryProductsModel({this.message, this.ok, this.data, this.count});

  CategoryProductsModel.fromJson(Map<String, dynamic> json) {
    message = json["message"];
    ok = json["ok"];
    data = json["data"] == null ? null : (json["data"] as List).map((e) => CategoryProductsData.fromJson(e)).toList();
    count = json["count"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["message"] = message;
    data["ok"] = ok;
    // if(data != null) {
    //   data["data"] = data?.map((e) => e.toJson()).toList();
    // }
    data["count"] = count;
    return data;
  }
}

class CategoryProductsData {
  String? id;
  String? productName;
  String? productCode;
  List<String>? productImages;
  String? description;
  int? purchasedPrice;
  int? customerPrice;
  int? stock;
  String? brand;
  int? dealerPrice;
  int? strikePrice;
  bool? active;
  Specifications? specifications;
  General? general;
  String? category;
  String? createdAt;
  String? updatedAt;
  int? v;
  List<Offers>? offers;

  CategoryProductsData({this.id, this.productName, this.productCode, this.productImages, this.description, this.purchasedPrice, this.customerPrice, this.stock, this.brand, this.dealerPrice, this.strikePrice, this.active, this.specifications, this.general, this.category, this.createdAt, this.updatedAt, this.v, this.offers});

  CategoryProductsData.fromJson(Map<String, dynamic> json) {
    id = json["_id"];
    productName = json["productName"];
    productCode = json["productCode"];
    productImages = json["productImages"] == null ? null : List<String>.from(json["productImages"]);
    description = json["description"];
    purchasedPrice = json["purchasedPrice"];
    customerPrice = json["customerPrice"];
    stock = json["stock"];
    brand = json["brand"];
    dealerPrice = json["dealerPrice"];
    strikePrice = json["strikePrice"];
    active = json["active"];
    specifications = json["specifications"] == null ? null : Specifications.fromJson(json["specifications"]);
    general = json["general"] == null ? null : General.fromJson(json["general"]);
    category = json["category"];
    createdAt = json["createdAt"];
    updatedAt = json["updatedAt"];
    v = json["__v"];
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
    data["description"] = description;
    data["purchasedPrice"] = purchasedPrice;
    data["customerPrice"] = customerPrice;
    data["stock"] = stock;
    data["brand"] = brand;
    data["dealerPrice"] = dealerPrice;
    data["strikePrice"] = strikePrice;
    data["active"] = active;
    if(specifications != null) {
      data["specifications"] = specifications?.toJson();
    }
    if(general != null) {
      data["general"] = general?.toJson();
    }
    data["category"] = category;
    data["createdAt"] = createdAt;
    data["updatedAt"] = updatedAt;
    data["__v"] = v;
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
