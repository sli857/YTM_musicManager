import mongoose from "mongoose";
import privateLib from "./models/privateLib.js";

const main = async () => {
  mongoose.connect("mongodb://localhost:2717/testDB");
  const demo = new privateLib({
    type: "test",
    id: 1,
  });
  demo.save().then(() => console.log(demo));
};

main();
