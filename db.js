import fs from "fs";
import { Library, PrivateLib, Playlist, Track, User } from "./models.js";

async function insertIndex2Library() {
  try {
    const data = fs.readFileSync("./Library/index.json", "utf-8");
    const index = await JSON.parse(data);
    await Library.insertMany(index);
    process.exit();
  } catch (err) {
    console.log(err);
  }
}

export { insertIndex2Library };
