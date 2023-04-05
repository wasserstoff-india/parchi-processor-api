//setting up connection with mongoose
import mongoose from "mongoose";
import { MONDODB_URL } from "./config.js";
mongoose.connect(MONDODB_URL);
const db = mongoose.connection;

db.once("open", function () {
  console.log("Connected to Database :: MongoDB");
});

export default db;