import mongoose, { Schema, model } from "mongoose";



const OfferSchema = new Schema({
  from: {
    type: Number,
    required: true,
  },
  to: {
    type: Number,
    required: true,
  },
  customerPrice: {
    type: Number,
    required: true,
  },
  dealerPrice: {
    type: Number,
    required: true,
  },

}, { _id: false });

const ProductSchema = new Schema({
  productName: {
    type: String,
    required: [true, "Please enter product name"],
  },
  productCode: {
    type: String,
    required: [true, "Please enter product code"],
  },
  productImages: { type: [String], required: true },
  description: {
    type: String,
    required: [true, "Please enter description"],
  },
  purchasedPrice: {
    type: Number,
    required: [true, "Please Enter the Cost Price"],
  },
  customerPrice: {
    type: Number,
    required: [true, "Please Enter the Selling Price"],
  },
  stock: {
    type: Number,
    required: true
  },
  brand: {
    type: String,
    required: [true, "Please Enter the Selling Price"],
  },
  dealerPrice: {
    type: Number,
    required: [true, "Please Enter the Selling Price"],
  },
  strikePrice: {
    type: Number,
    required: [true, "Please enter the strike price"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  specifications: {
    type: Map,
    of: Map,
    default: {},
  },
  general: {
    type: Map,
    of: String, 
    default: {},
  },
  offers: {
    type: [OfferSchema], 
    default: [], 
  },
  isDeleted:{
    type: Boolean,
    default: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', 
    required: [true, 'Please enter the category'],
  },
}, { timestamps: true });

export const ProductModel = model("Product", ProductSchema);
