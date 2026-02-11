import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  categoryName: {
    type: String, 
    unique: true,
    required: [true,'Please enter the Category Name']
  },
  image: {
    type: String,
    required: [true,"Please upload Banner Image"] 
  },
  active:{
    type:Boolean,
    default:true
  },
  isDeleted:{
    type:Boolean,
    default:false
  },
});

export const CategoryModel = mongoose.model('Category', CategorySchema);
