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
      // const pid = Math.floor(Math.random() * 10000);
      const pid = albumId;
      const plist = new Playlist({
        pid: pid,
        name: tracks[0].album,
        image: `../Library/${albumId}.jpg`,
        type: "album",
      });
      await plist
        .save()
        .then(console.log("index updated"))
        .catch((err) => {
          console.log(`ignored: ${err}`);
        });

      const collectionName = `p_${pid}`;
      dbConnection.createCollection(collectionName);
      const thisTrackList = mongoose.model(
        "track",
        trackSchema,
        collectionName
      );
      const collection = dbConnection.collection(collectionName);
      const trackList = tracks.map((track, i) => {
        return collection.insertOne({ tid: track.trackid, order: i });
      });
      Promise.all(trackList)
        .then(console.log(`${collectionName} updated successfully`))
        .catch((err) => {
          console.error(err);
        });
    }
    return;
  } catch (err) {
    console.log(err);
  }
}
export { dbInit };
