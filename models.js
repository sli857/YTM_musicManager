import mongoose, { Schema } from "mongoose";
import autoIncre from "mongoose-sequence";

const dbport = 2717;
// Connect to different databases
const userConnection = mongoose.createConnection(
  `mongodb://localhost:${dbport}/Users`
);

const libraryConnection = mongoose.createConnection(
  `mongodb://localhost:${dbport}/Library`
);

const playlistConnection = mongoose.createConnection(
  `mongodb://localhost:${dbport}/Playlists`
);
const historyConnection = mongoose.createConnection(
  `mongodb://localhost:${dbport}/History`
);

var librarySchema = new mongoose.Schema({
  track_id: String,
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
});
var Library = libraryConnection.model("music-metadata", librarySchema);

// Define privateLib schema
var privateLibSchema = new mongoose.Schema({
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
});

// TODO: replace uid
const PrivateLib = playlistConnection.model("u_<uid>", privateLibSchema);

var playlistSchemma = new mongoose.Schema({
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
});

const Playlists = playlistConnection.model("index", playlistSchemma);

// Define track schema
var trackSchema = new mongoose.Schema({
  tid: Number, //track_id
});
trackSchema.plugin(autoIncre(mongoose), { inc_field: "tid" });

//TODO: replace pid
const Track = playlistConnection.model("p_<pid>", trackSchema);

// Define user schema
var userSchema = new mongoose.Schema({
  uid: Number,
  name: String,
  secret: String,
  subscribe: String,
  subscribe_expired: Date,
  last_login: Date,
  playing: Number, //Machine_Id
});

const User = userConnection.model("User", userSchema);

// Export the models
export { Library, PrivateLib, Playlists, Track, User };
