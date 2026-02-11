import { model, Schema } from "mongoose";

const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});
const UserSchema = new Schema(
  {
    username: {
      type: String,
    },
    role: {
      type: String,
      required: [true, "Please enter user role"],
    },
    cart: [CartItemSchema],
    profileImage: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: [true, "Please enter mobile number"],
      unique: true,
    },
    userid: {
      type: String,
    },
    fcmToken: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    deliveryAddress: [
      {
        tag: {
          type: String,
        },
        address: {
          flatNumber: {
            type: String,
          },
          area: {
            type: String,
          },
          nearbyLandmark: {
            type: String,
          },
          receiverName: {
            type: String,
          },
          receiverMobileNumber: {
            type: String,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

export const UserModel = model("User", UserSchema);

const CounterSchema = new Schema({
  name: { type: String, required: true },
  count: { type: Number, default: 0 },
});

export const CounterModel = model("Counter", CounterSchema);
