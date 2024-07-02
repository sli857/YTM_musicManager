import fs from "fs";
import { Library, PrivateLib, Playlists, User, Track } from "./models.js";

async function insertIndex2Library() {
  try {
    const data = fs.readFileSync("./Library/index.json", "utf-8");
    const index = JSON.parse(data);
    await Library.insertMany(index);
    process.exit();
  } catch (err) {
    console.log(err);
  }
}

const main = async () => {
  insertIndex2Library();
};

main();
