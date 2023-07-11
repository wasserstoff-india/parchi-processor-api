import mongoose from 'mongoose';
const VectorSchema = new mongoose.Schema({
  vector: [Number],
});
const Vector = mongoose.model('Vector', VectorSchema);
export default Vector;
