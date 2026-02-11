import { Schema, model } from "mongoose";


const TestimonialSchema = new Schema(
  {
    Clientname: {
      type: String,
      required: true,
    },
    profession: {
      type: String,
      required: true,
    },
testimonial: {
      type: String,
      required: true,
    },
    active:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
  },
  {
    timestamps: true,
  }
);

const TestimonialModel = model("Tesimonial", TestimonialSchema);
export { TestimonialModel};