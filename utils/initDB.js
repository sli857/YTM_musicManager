import fs from "fs";

import {
  dbConnection,
  librarySchema,
  indexSchema,
  trackSchema,
  playlistSchemma,
  userSchema,
} from "../models/models.js";
import mongoose from "mongoose";

async function dbInit(indexPath) {
  try {
    // init Library
    const library = dbConnection.model("library", librarySchema, "Libraries");
    const data = fs.readFileSync(indexPath, "utf-8");
    const index = await JSON.parse(data);
    library
      .insertMany(index)
      .then(() => {
        console.log("Library saved to db.");
      })
      .catch((err) => {
        console.error(err);
      });

    // init Playlist
    const albums = new Map();
    for (const item of index) {
      const albumId = item.album_id;
      if (!albums.has(albumId)) {
        albums.set(albumId, []);
      }

      albums.get(albumId).push({
        album: item.album,
        trackid: item.trackid,
      });
    }
    const Playlist = dbConnection.model(
      "playlists",
      playlistSchemma,
      "Playlists"
    );
    for (const [albumId, tracks] of albums.entries()) {
      const pid = Math.floor(Math.random() * 10000);
      const plist = new Playlist({
        pid: pid,
        name: tracks[0].album,
        image: `../Library/${albumId}.jpg`,
        type: "album",
      });
      await plist.save();
      const thisTrackList = await mongoose.model(
        "track",
        trackSchema,
        `p_${pid}`
      );
      const trackPromises = tracks.map((track) => ({
        insertOne: { document: { tid: track.trackid } },
      }));
      await thisTrackList.bulkWrite(trackPromises);

      console.log("bing bong");
    }
  } catch (err) {
    console.log(err);
  }
}
export { dbInit };
