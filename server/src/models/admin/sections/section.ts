import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  Title: {
    type: String,
    unique: true,
    required: [true, "Please enter Banner Title"],
  },
  Description: {
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
  Products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', 
      required: true,
    },
  ],
});

export const SectionModel = mongoose.model('Sections', SectionSchema);
