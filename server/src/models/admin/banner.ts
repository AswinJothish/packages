import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  Title:{
    type: String,
    unique: true,
    required: [true, "Please enter Banner Title"]
},
Description:{
    type: String,
},
active:{
  type:Boolean,
  default:true
},
isDeleted:{
  type:Boolean,
  default:false
},
  BannerImage:{ 
    type: String, 
    required: [true,"Please upload Banner Image"] },
});

export const BannerModel = mongoose.model('Banner', BannerSchema);
