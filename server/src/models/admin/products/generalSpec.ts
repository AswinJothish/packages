import mongoose from 'mongoose';

const GeneralSpecSchema = new mongoose.Schema({
  General: {
    type: [String],
    required: true,
  }
});

export const GeneralSpecModel = mongoose.model('GeneralSpec', GeneralSpecSchema);
