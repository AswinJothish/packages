import mongoose from 'mongoose';

const SpecificationSchema = new mongoose.Schema({
  category: {
    type: String, 
    required: true,
    unique:true
  },
  fields: {
    type: [String],  
    required: true
  }
});

export const SpecificationModel = mongoose.model('Specification', SpecificationSchema);
