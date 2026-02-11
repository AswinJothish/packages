import { model, Schema } from "mongoose";

const AdminSchema = new Schema(
  {
    username: {
      type: String,
    },
    role: {
      type: String,
      required: [true, "Please enter user role"],
    },
    profileImage: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: [true, "Please enter mobile number"],
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export const AdminModel = model("Admin", AdminSchema);
