import { Schema, model } from "mongoose";

const PaymentSchema: Schema = new Schema(
  {
    paymentImage: { type: String },
    transactionId: { type: String },
    cash: { type: Number },
    updatedBy:{typr:String},
    verified:{type:String},
  }
);
const PaymentDetailsSchema: Schema = new Schema(
  {
    date:{type:String},
    paymentImage: { type: String}, 
    transactionId: { type: String},
    mode: { type: String, required: true, enum: ['cash', 'UPI'] }, 
    paidAmount: { type: Number, required: true }, 
    balanceAmount: { type: Number, required: true }, 
  },
  { timestamps: true } 
);
const OrderSchema: Schema = new Schema(
  {
    orderedBy: { type: String, required: true },
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderDate: { type: String, required: true },
    deliveryAddress: {
      type: Map,
      of: Map,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled","delivered","outfordelivery","assigned","picked","rejected"],
      default: "pending",
    },
    deliveryCharges: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    EditedDate: {
      type: String,
    },
    discount: {
      type: {
        type: String,
        enum: ["amount", "percentage"], 
      },
      value: { type: Number, default: 0 }
    },
    deliveryAgent: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryAgent",
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    payment: [PaymentSchema], 
    paymentDetails: [PaymentDetailsSchema],
  },
  { timestamps: true }
);

export const OrderModel = model("Order", OrderSchema);
