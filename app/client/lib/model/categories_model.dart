// class CategoryModel {
//   String? message;
//   bool? ok;
//   List<CategoryData>? data;
//
//   CategoryModel({this.message, this.ok, this.data});
//
//   CategoryModel.fromJson(Map<String, dynamic> json) {
//     message = json['message'];
//     ok = json['ok'];
//     if (json['data'] != null) {
//       data = <CategoryData>[];
//       json['data'].forEach((v) {
//         data!.add(new CategoryData.fromJson(v));
//       });
//     }
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = new Map<String, dynamic>();
//     data['message'] = this.message;
//     data['ok'] = this.ok;
//     if (this.data != null) {
//       data['data'] = this.data!.map((v) => v.toJson()).toList();
//     }
//     return data;
//   }
// }
//
// class CategoryData {
//   String? sId;
//   List<String>? category;
//   String? image;
//   bool? active;
//   bool? isDeleted;
//   int? iV;
//
//   CategoryData({this.sId, this.category,this.image, this.active, this.isDeleted, this.iV});
//
//   CategoryData.fromJson(Map<String, dynamic> json) {
//     sId = json['_id'];
//     category = json['Category'].cast<String>();
//     image = json["image"];
//     active = json["active"];
//     isDeleted = json["isDeleted"];
//     iV = json['__v'];
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     data['_id'] = this.sId;
//     data['Category'] = this.category;
//     data["image"] = image;
//     data["active"] = active;
//     data["isDeleted"] = isDeleted;
//     data['__v'] = this.iV;
//     return data;
//   }
// }
//
//


class CategoryModel {
  String? message;
  bool? ok;
  List<CategoryData>? data;

  CategoryModel({this.message, this.ok, this.data});

  CategoryModel.fromJson(Map<String, dynamic> json) {
    message = json["message"];
    ok = json["ok"];
    data = json["data"] == null ? null : (json["data"] as List).map((e) => CategoryData.fromJson(e)).toList();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["message"] = message;
    data["ok"] = ok;
    // if(data != null) {
    //   data["data"] = data?.map((e) => e.toJson()).toList();
    // }
    return data;
  }
}

class CategoryData {
  String? id;
  String? categoryName;
  String? image;
  bool? active;
  bool? isDeleted;
  int? v;

  CategoryData({this.id, this.categoryName, this.image, this.active, this.isDeleted, this.v});

  CategoryData.fromJson(Map<String, dynamic> json) {
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