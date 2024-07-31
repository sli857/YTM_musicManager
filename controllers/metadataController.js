import fs from "fs";

import { dbConnection } from "../models/models.js";

const getTrackImage = async ({ pid, trackid }) => {
  try {
    if (pid !== undefined) {
      return fs.readFileSync(`./Library/${pid}.jpg`);
    }
    const Library = dbConnection.collection("Libraries");
    const track = await Library.findOne({ tid: trackid });
    if (!track) {
      return null;
    }
    return fs.readFileSync(`./Library/${track.album}.jpg`);
  } catch (err) {
    console.log(err);
  }
};

const getTrackName = async ({ trackid }) => {
  try {
    const Library = dbConnection.collection("Libraries");
    const track = await Library.findOne({ trackid: trackid });
    if (!track) {
      return null;
    }
    return track.title;
  } catch (err) {
    console.log(err);
  }
};

export { getTrackImage, getTrackName };
