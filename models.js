import mongoose from "mongoose";
import pkg from "mongoose";
const { Collection, Schema } = pkg;
import autoIncre from "mongoose-sequence";

const dbport = 2717;

const dbConnection = mongoose.createConnection(
  `mongodb://localhost:${dbport}/ytm-db`
);

var librarySchema = new mongoose.Schema(
  {
    trackid: { type: String, index: true },
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

const Library = dbConnection.model("library", librarySchema);

var privateLibSchema = new mongoose.Schema(
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

const PrivateLib = dbConnection.model("private-lib", privateLibSchema);

var playlistSchemma = new mongoose.Schema(
  {
    pid: Number,
    author: Number, //uid
    name: String,
    description: String,
    added: Number,
    liked: Number,
    shared: Number,
    played: Number,
    public: Boolean,
    image: String,
    type: {
      type: String,
      enum: ["playlist", "album"],
    },
    last_update: Date,
  },
  { Collection: "playlists" }
);

const Playlist = dbConnection.model("playlist", playlistSchemma);

// Define track schema
var trackSchema = new mongoose.Schema(
  {
    tid: Number, //track_id
    order: Number,
  },
  { Collection: "playlists" }
);
trackSchema.plugin(autoIncre(mongoose), { inc_field: "order" });

const Track = dbConnection.model("tracks", trackSchema);

//TODO: replace pid

// Define user schema
var userSchema = new mongoose.Schema(
  {
    uid: Number,
    name: { type: String, unique: true },
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

const User = dbConnection.model("user", userSchema);

// Export the models
export { Library, PrivateLib, Playlist, Track, User };
