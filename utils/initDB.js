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
    // init User
    const User = dbConnection.model("User", userSchema, "Users");
    const user = new User({
      name: "admin",
      secret: "admin",
    });
    await user
      .save()
      .then(() => {
        console.log("Admin saved to db.");
      })
      .catch((err) => {
        if (err.code === 11000) {
        }
      });

    // init Library
    const library = dbConnection.model("library", librarySchema, "Libraries");
    const data = fs.readFileSync(indexPath, "utf-8");
    const index = JSON.parse(data);
    await library
      .insertMany(index)
      .then(() => {
        console.log("Library saved to db.");
      })
      .catch((err) => {
        if (err.code === 11000) {
          console.log("Library already exists in db.");
        } else {
          throw err;
        }
      });

    // init Playlist
    const albums = new Map();
    index.forEach((item) => {
      const { album_id, album, trackid } = item;
      if (!albums.has(album_id)) {
        albums.set(album_id, { album, tracks: [] });
      }
      albums.get(album_id).tracks.push({ trackid });
    });

    const Playlist = dbConnection.model(
      "playlists",
      playlistSchemma,
      "Playlists"
    );

    var playlistInsertionPromises = [];
    for (const [albumId, { album, tracks }] of albums.entries()) {
      // const pid = Math.floor(Math.random() * 10000);
      const pid = albumId;
      const plist = new Playlist({
        pid: pid,
        name: album,
        image: `../Library/${albumId}.jpg`,
        type: "album",
      });
      const playlistPromise = plist
        .save()
        .then(console.log(`Playlist inserted successfully: ${album}`))
        .catch((err) => {
          if (err.code === 11000) {
            console.log(`Playlist already exists: ${album}`);
          } else {
            throw err;
          }
        });
      playlistInsertionPromises.push(playlistPromise);
      const collectionName = `p_${pid}`;
      const albumCollection = dbConnection.collection(collectionName);
      const Track = mongoose.model("track", trackSchema, collectionName);
      const trackDocuments = tracks.map((track, i) => {
        return new Track({ tid: track.trackid, order: i });
      });
      const albumInsertionPromises = albumCollection
        .insertMany(trackDocuments)
        .then(() => {
          console.log(`Tracks inserted successfully: ${collectionName}`);
        })
        .catch((err) => {
          if (err.code === 11000) {
            console.log(`Tracks already exists: ${collectionName}`);
          } else {
            throw err;
          }
        });

      await Promise.all([albumInsertionPromises]);
    }
    await Promise.all(playlistInsertionPromises);
    return;
  } catch (err) {
    console.log(err);
  }
}
export { dbInit };
