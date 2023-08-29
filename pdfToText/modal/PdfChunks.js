import mongoose from 'mongoose';
const ChunkSchema = new mongoose.Schema({
  pageContent: {
    type: String,
  },
});
const Chunks = mongoose.model('Chunks', ChunkSchema);
export default Chunks;
