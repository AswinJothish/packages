// import 'package:client/model/product_model.dart';
//
// import '../contants/config.dart';
//
//
// class ProductDetail {
//   String? message;
//   bool? ok;
//   List<ProductDetails>? productdetails;
//   int? total;
//
//   ProductDetail({this.message, this.ok, this.productdetails, this.total});
//
//   ProductDetail.fromJson(Map<String, dynamic> json) {
//     message = json['message'];
//     ok = json['ok'];
//     if (json['products'] != null) {
//       productdetails = <ProductDetails>[];
//       json['products'].forEach((v) {
//         productdetails!.add(new ProductDetails.fromJson(v));
//       });
//     }
//     total = json['total'];
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = new Map<String, dynamic>();
//     data['message'] = this.message;
//     data['ok'] = this.ok;
//     if (this.productdetails != null) {
//       data['productdetails'] = this.productdetails!.map((v) => v.toJson()).toList();
//     }
//     data['total'] = this.total;
//     return data;
//   }
// }
//
//
// class ProductDetails {
//   String? sId;
//   String? productName;
//   String? productCode;
//   List<String>? productImages;
//   String? description;
//   int? purchasedPrice;
//   int? customerPrice;
//   String? brand;
//   int? dealerPrice;
//   int? strikePrice;
//   bool? active;
//   // Specifications? specifications;
//   Map<String, dynamic>? specifications;
//     Map<String, dynamic>? general;
//   String? category;
//   String? createdAt;
//   String? updatedAt;
//   int? stock;
//   int? iV;
//   List<Offers>? offers;
//
//   ProductDetails({
//     this.sId,
//     this.productName,
//     this.productCode,
//     this.productImages,
//     this.description,
//     this.purchasedPrice,
//     this.customerPrice,
//     this.brand,
//     this.dealerPrice,
//     this.strikePrice,
//     this.active,
//     this.specifications,
//     this.general,
//     this.category,
//     this.createdAt,
//     this.updatedAt,
//     this.stock,
//     this.iV,
//     this.offers
//   });
//
//   ProductDetails.fromJson(Map<String, dynamic> json) {
//     sId = json['_id'];
//     productName = json['productName'];
//     productCode = json['productCode'];
//     productImages = json['productImages'] != null
//         ? List<String>.from(json['productImages'])
//         : null;
//     description = json['description'];
//     purchasedPrice = json['purchasedPrice'];
//     customerPrice = json['customerPrice'];
//     brand = json['brand'];
//     dealerPrice = json['dealerPrice'];
//     strikePrice = json['strikePrice'];
//     active = json['active'];
//     specifications = json ['specifications'];
//     general =
//     json['general'];
//     category = json['category'];
//     createdAt = json['createdAt'];
//     updatedAt = json['updatedAt'];
//     stock = json['stock'];
//     iV = json['__v'];
//     offers = json["offers"] == null ? null : (json["offers"] as List).map((e) => Offers.fromJson(e)).toList();
//   }
//
//   // Getter to return the first image URL with the full path
//   // String get fullImageUrl {
//   //   if (productImages != null && productImages!.isNotEmpty) {
//   //     return '${AppConfig.imageUrl}admin/files/view?key=${productImages![0]}';
//   //   } else {
//   //     return '${AppConfig.imageUrl}admin/files/view?key=default_image/';
//   //   }
//   // }
//   List<String> get fullImageUrl {
//     if (productImages != null && productImages!.isNotEmpty) {
//       return productImages!.map((imageKey) {
//         return '${AppConfig.imageUrl}$imageKey';
//       }).toList();
//     } else {
//       // Return a list with a default image if no images exist
//       return ['${AppConfig.imageUrl}admin/files/view?key=default_image/'];
//     }
//   }
//
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     data['_id'] = sId;
//     data['productName'] = productName;
//     data['productCode'] = productCode;
//     data['productImages'] = productImages;
//     data['description'] = description;
//     data['purchasedPrice'] = purchasedPrice;
//     data['customerPrice'] = customerPrice;
//     data['brand'] = brand;
//     data['dealerPrice'] = dealerPrice;
//     data['strikePrice'] = strikePrice;
//     data['active'] = active;
//     data['category'] = this.category;
//     data['createdAt'] = createdAt;
//     data['updatedAt'] = updatedAt;
//     data['stock'] = stock;
//     data['__v'] = iV;
//     if(offers != null) {
//       data["offers"] = offers?.map((e) => e.toJson()).toList();
//     }
//     return data;
//   }
// }
//
//
// class Offers {
//   int? from;
//   int? to;
//   int? customerPrice;
//   int? dealerPrice;
//
//   Offers({this.from, this.to, this.customerPrice});
//
//   Offers.fromJson(Map<String, dynamic> json) {
//     from = json["from"];
//     to = json["to"];
//     customerPrice = json["customerPrice"];
//     dealerPrice = json ["dealerPrice"];
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> _data = <String, dynamic>{};
//     _data["from"] = from;
//     _data["to"] = to;
//     _data["customerPrice"] = customerPrice;
//     _data["dealerPrice"];
//     return _data;
//   }
// }
//
//
// class Specifications {
//   Warranty? warranty;
//   Performance? performance;
//   General? general;
//
//   Specifications({this.warranty, this.performance, this.general});
//
//   Specifications.fromJson(Map<String, dynamic> json) {
//     warranty = json['Warranty'] != null ? Warranty.fromJson(json['Warranty']) : null;
//     performance = json['Performance'] != null ? Performance.fromJson(json['Performance']) : null;
//     general = json['General'] != null ? General.fromJson(json['General']) : null;
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     if (warranty != null) {
//       data['Warranty'] = warranty!.toJson();
//     }
//     if (performance != null) {
//       data['Performance'] = performance!.toJson();
//     }
//     if (general != null) {
//       data['General'] = general!.toJson();
//     }
//     return data;
//   }
// }
//
// class Warranty {
//   String? warrantySummary;
//   String? warrantyServiceType;
//   String? notCoveredInWarranty;
//   String? warrantyCoverage;
//
//   Warranty({
//     this.warrantySummary,
//     this.warrantyServiceType,
//     this.notCoveredInWarranty,
//     this.warrantyCoverage,
//   });
//
//   Warranty.fromJson(Map<String, dynamic> json) {
//     warrantySummary = json['Warranty Summary'];
//     warrantyServiceType = json['Warranty Service Type'];
//     notCoveredInWarranty = json['Not Covered in Warranty'];
//     warrantyCoverage = json['Warranty Coverage'];
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     data['Warranty Summary'] = warrantySummary;
//     data['Warranty Service Type'] = warrantyServiceType;
//     data['Not Covered in Warranty'] = notCoveredInWarranty;
//     data['Warranty Coverage'] = warrantyCoverage;
//     return data;
//   }
// }
//
// class Performance {
//   String? filtrationCapacity;
//   String? purificationCapacity;
//   String? installationMethod;
//   String? powerConsumption;
//
//   Performance({
//     this.filtrationCapacity,
//     this.purificationCapacity,
//     this.installationMethod,
//     this.powerConsumption,
//   });
//
//   Performance.fromJson(Map<String, dynamic> json) {
//     filtrationCapacity = json['Filtration capacity'];
//     purificationCapacity = json['Purification Capacity'];
//     installationMethod = json['Installation Method'];
//     powerConsumption = json['Power Consumption'];
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     data['Filtration capacity'] = filtrationCapacity;
//     data['Purification Capacity'] = purificationCapacity;
//     data['Installation Method'] = installationMethod;
//     data['Power Consumption'] = powerConsumption;
//     return data;
//   }
// }
//
// class General {
//   String? model;
//   String? color;
//
//   General({this.model, this.color});
//
//   General.fromJson(Map<String, dynamic> json) {
//     model = json['Model'];
//     color = json['Color'];
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     data['Model'] = model;
//     data['Color'] = color;
//     return data;
//   }
// }
//
// class GeneralType {
//   String? capacity;
//   String? type;
//
//   GeneralType({this.capacity, this.type});
//
//   GeneralType.fromJson(Map<String, dynamic> json) {
//     capacity = json['Capacity'];
//     type = json['Type'];
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = new Map<String, dynamic>();
//     data['Capacity'] = this.capacity;
//     data['Type'] = this.type;
//     return data;
//   }
// }



import '../contants/config.dart';

class ProductDetail {
  String? message;
  bool? ok;
  ProductDetails? productdetails;

  ProductDetail({this.message, this.ok, this.productdetails});

  ProductDetail.fromJson(Map<String, dynamic> json) {
    message = json["message"];
    ok = json["ok"];
    productdetails = json["data"] == null ? null : ProductDetails.fromJson(json["data"]);
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["message"] = message;
    data["ok"] = ok;
    if(productdetails != null) {
      data["data"] = productdetails?.toJson();
    }
    return data;
  }
}

class ProductDetails {
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
  List<Offers>? offers;
  bool? isDeleted;
  Category? category;
  String? createdAt;
  String? updatedAt;
  int? v;

  ProductDetails({this.id, this.productName, this.productCode, this.productImages, this.description, this.purchasedPrice, this.customerPrice, this.stock, this.brand, this.dealerPrice, this.strikePrice, this.active, this.specifications, this.general, this.offers, this.isDeleted, this.category, this.createdAt, this.updatedAt, this.v});
  List<String> get fullImageUrl {
    if (productImages != null && productImages!.isNotEmpty) {
      return productImages!.map((imageKey) {
        return '${AppConfig.imageUrl}$imageKey';
      }).toList();
    } else {
      // Return a list with a default image if no images exist
      return ['${AppConfig.imageUrl}admin/files/view?key=default_image/'];
    }
  }
  ProductDetails.fromJson(Map<String, dynamic> json) {
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
    general = json['general'] == null ? null : General.fromJson(json['general']);
    offers = json["offers"] == null ? null : (json["offers"] as List).map((e) => Offers.fromJson(e)).toList();
    isDeleted = json["isDeleted"];
    category = json["category"] == null ? null : Category.fromJson(json["category"]);
    createdAt = json["createdAt"];
    updatedAt = json["updatedAt"];
    v = json["__v"];
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
    if(offers != null) {
      data["offers"] = offers?.map((e) => e.toJson()).toList();
    }
    data["isDeleted"] = isDeleted;
    if(category != null) {
      data["category"] = category?.toJson();
    }
    data["createdAt"] = createdAt;
    data["updatedAt"] = updatedAt;
    data["__v"] = v;
    return data;
  }
}

class Category {
  String? id;
  String? categoryName;
  String? image;
  bool? active;
  bool? isDeleted;
  int? v;

  Category({this.id, this.categoryName, this.image, this.active, this.isDeleted, this.v});

  Category.fromJson(Map<String, dynamic> json) {
    id = json["_id"];
    categoryName = json["categoryName"];
    image = json["image"];
    active = json["active"];
    isDeleted = json["isDeleted"];
    v = json["__v"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["_id"] = id;
    data["categoryName"] = categoryName;
    data["image"] = image;
    data["active"] = active;
    data["isDeleted"] = isDeleted;
    data["__v"] = v;
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

class General {
  String? color;
  String? material;

  General({this.color, this.material});

  // JSON constructor
  General.fromJson(Map<String, dynamic> json) {
    color = json["Color"];
    material = json["Material"];
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      "Color": color,
      "Material": material,
    };
  }

  // ✅ Convert to a Map<String, String> for UI display
  Map<String, String> toMap() {
    return {
      "Color": color ?? "N/A",
      "Material": material ?? "N/A",
    };
  }
}

class Specifications {
  Warranty? warranty;

  Specifications({this.warranty});

  Specifications.fromJson(Map<String, dynamic> json) {
    warranty = json["Warranty"] == null ? null : Warranty.fromJson(json["Warranty"]);
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if(warranty != null) {
      data["Warranty"] = warranty?.toJson();
    }
    return data;
  }
}

class Warranty {
  String? coveredInWarranty;
  String? notCoveredInWarranty;
  String? warrantyType;
  String? warrantySummary;

  Warranty({this.coveredInWarranty, this.notCoveredInWarranty, this.warrantyType, this.warrantySummary});

  Warranty.fromJson(Map<String, dynamic> json) {
    coveredInWarranty = json["Covered In warranty"];
    notCoveredInWarranty = json["Not covered in warranty"];
    warrantyType = json["Warranty Type"];
    warrantySummary = json["Warranty Summary"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["Covered In warranty"] = coveredInWarranty;
    data["Not covered in warranty"] = notCoveredInWarranty;
    data["Warranty Type"] = warrantyType;
    data["Warranty Summary"] = warrantySummary;
    return data;
  }
}