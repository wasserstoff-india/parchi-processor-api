import mongoose from "mongoose";
const EmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
);
const Email = mongoose.model("Email", EmailSchema);
export default Email;