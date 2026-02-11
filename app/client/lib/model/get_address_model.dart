
class GetAddressModel {
  String? message;
  bool? ok;
  List<DeliveryAddressList>? deliveryAddress;

  GetAddressModel({this.message, this.ok, this.deliveryAddress});

  GetAddressModel.fromJson(Map<String, dynamic> json) {
    message = json["message"];
    ok = json["ok"];
    deliveryAddress = json["deliveryAddress"] == null ? null : (json["deliveryAddress"] as List).map((e) => DeliveryAddressList.fromJson(e)).toList();
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data["message"] = message;
    data["ok"] = ok;
    if(deliveryAddress != null) {
      data["deliveryAddress"] = deliveryAddress?.map((e) => e.toJson()).toList();
    }
    return data;
  }
}

class DeliveryAddressList {
  Address? address;
  String? tag;
  String? id;

  DeliveryAddressList({this.address, this.tag, this.id});

  DeliveryAddressList.fromJson(Map<String, dynamic> json) {
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