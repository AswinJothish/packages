
//add to cart model

class addtocart {
  int? status;
  String? message;
  List<AddCart>? cart;

  addtocart({this.status, this.message, this.cart});

  addtocart.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    if (json['cart'] != null) {
      cart = <AddCart>[];
      json['cart'].forEach((v) {
        cart!.add(AddCart.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    if (cart != null) {
      data['cart'] = cart!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class AddCart {
  String? productId;
  int? quantity;
  String? sId;

  AddCart({this.productId, this.quantity, this.sId});

  AddCart.fromJson(Map<String, dynamic> json) {
    productId = json['productId'];
    quantity = json['quantity'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['productId'] = productId;
    data['quantity'] = quantity;
    data['_id'] = sId;
    return data;
  }
}
