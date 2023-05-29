import mongoose from 'mongoose';
const EmailSchema = new mongoose.Schema({
  // userId: {
  //   type: String,
  // },
  waId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Email = mongoose.model('Email', EmailSchema);
export default Email;
