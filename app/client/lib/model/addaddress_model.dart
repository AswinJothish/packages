class AddAddressModel {
  String? customerId;
  String? tag;
  AddAddress? address;

  AddAddressModel({this.customerId, this.tag, this.address});
}

class AddAddress {
  String? id;
  String? flatNumber;
  String? area;
  String? nearbyLandmark;
  String? receiverName;
  String? receiverMobileNumber;

  AddAddress(
      {this.id,
      this.flatNumber,
      this.area,
      this.nearbyLandmark,
      this.receiverName,
      this.receiverMobileNumber});
}
