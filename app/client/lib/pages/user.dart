
class User {
  String? message;
  String? token;
  UserData? userData;
  bool? ok;

  User({this.message, this.token, this.userData, this.ok});

  User.fromJson(Map<String, dynamic> json) {
    message = json["message"]?.toString();
    token = json["token"]?.toString();
    userData = (json["userData"] is Map)
        ? UserData.fromJson(json["userData"])
        : null; // Handle non-Map cases
    ok = json["ok"] as bool?;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["message"] = message;
    data["token"] = token;
    if(userData != null) {
      data["userData"] = userData?.toJson();
    }
    data["ok"] = ok;
    return data;
  }
}

class UserData {
  String? id;
  String? mobileNumber;
  String? role;
  String? username;
  List<DeliveryAddress>? deliveryAddress;
  String? userid;
  bool? active;

  UserData({this.id, this.mobileNumber, this.role, this.username, this.deliveryAddress, this.userid, this.active});

  UserData.fromJson(Map<String, dynamic> json) {
    id = json["_id"];
    mobileNumber = json["mobileNumber"];
    role = json["role"];
    username = json["username"];
    deliveryAddress = json["deliveryAddress"] == null ? null : (json["deliveryAddress"] as List).map((e) => DeliveryAddress.fromJson(e)).toList();
    userid = json["userid"];
    active = json["active"];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["_id"] = id;
    data["mobileNumber"] = mobileNumber;
    data["role"] = role;
    data["username"] = username;
    if(deliveryAddress != null) {
      data["deliveryAddress"] = deliveryAddress?.map((e) => e.toJson()).toList();
    }
    data["userid"] = userid;
    data["active"] = active;
    return data;
  }
}

class DeliveryAddress {
  Address? address;
  String? tag;
  String? id;

  DeliveryAddress({this.address, this.tag, this.id});

  DeliveryAddress.fromJson(Map<String, dynamic> json) {
    address = json["address"] == null ? null : Address.fromJson(json["address"]);
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

class Address {
  String? flatNumber;
  String? area;
  String? nearbyLandmark;
  String? receiverName;
  String? receiverMobileNumber;

  Address({this.flatNumber, this.area, this.nearbyLandmark, this.receiverName, this.receiverMobileNumber});

  Address.fromJson(Map<String, dynamic> json) {
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