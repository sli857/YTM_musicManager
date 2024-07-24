import mongoose from "mongoose";
import pkg from "mongoose";
import { DB_PORT } from "../config/config.js";

const { Collection, Schema } = pkg;

const dbConnection = mongoose.createConnection(
  `mongodb://localhost:${DB_PORT}/ytm-db`,
  {
    serverSelectionTimeoutMS: 500000,
    socketTimeoutMS: 450000,
  }
);

var librarySchema = new mongoose.Schema(
  {
    trackid: { type: String, index: true, unique: true },
    title: String,
    artist: Array,
    album: String,
    album_id: String,
    genre: String,
    copyright: String,
    length: String,
    track_number: Number,
    quality: {
      type: String,
      default: "STD",
    },
    file: String,
  },
  { Collection: "libraries" }
);

var indexSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["track", "album", "playlist"],
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    added_data: { type: Date, default: Date.now() },
  },
  { Collection: "playlists" }
);

var trackSchema = new mongoose.Schema(
  {
    tid: { type: String, index: true }, //track_id
    order: Number,
  },
  { Collection: "playlists" }
);

var playlistSchemma = new mongoose.Schema(
  {
    pid: String,
    author: Number, //uid
    name: { type: String, unique: true },
    description: String,
    added: { type: Number, default: 0 },
    liked: { type: Number, default: 0 },
    shared: { type: Number, default: 0 },
    played: { type: Number, default: 0 },
    public: { type: Boolean, default: true },
    image: String,
    type: {
      type: String,
      enum: ["playlist", "album"],
    },
    last_update: Date,
  },
  { Collection: "playlists" }
);

var userSchema = new mongoose.Schema(
  {
    uid: Number,
    name: { type: String, index: true, unique: true },
    secret: String,
    subscribe: String,
    subscribe_expired: Date,
    last_login: Date,
    playing: Number, //Machine_Id
  },
  {
    Collection: "users",
  }
);

// Export the models
export {
  dbConnection,
  librarySchema,
  indexSchema,
  trackSchema,
  playlistSchemma,
  userSchema,
};
