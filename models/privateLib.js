import mongoose from "mongoose";

var privateLibSchema = new mongoose.Schema({
  type: String,
  id: Number,
  added_data: { type: Date, default: Date.now },
});

const privateLib = mongoose.model("privateLib", privateLibSchema);
export default privateLib;
