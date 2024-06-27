import { parentPort } from "worker_threads";
import { parseFile } from "music-metadata";
import fs, { readFile } from "fs";
import crypto from "crypto";

const storeImage = async (album_id, image) => {
  if (fs.existsSync(`./Library/${album_id}.jpg`)) {
    console.log(
      `Skipped album ${album_id}: Cover image has already been stored.`
    );
    return;
  }
  await fs.writeFile(`./Library/${album_id}.jpg`, image, (err) => {
    if (err) throw err;
  });
  console.log(`Stored Iamge: Album ${album_id}.`);
  return;
};

const writeToIndex = async (info) => {
  await fs.appendFile(
    "./Library/index.json",
    JSON.stringify(info, null, 0).concat(",\n"),
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

const generateTrackId = (artist, title, album) => {
  const tmp = `${artist}${title}${album}`;
  return crypto.createHash("md5").update(tmp).digest("hex").substring(0, 16);
};

const sec2mmss = (seconds) => {
  seconds = Math.round(seconds);
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, 0)}:${String(ss).padStart(2, 0)}`;
};

const indexCreate = async (path) => {
  try {
    const metadata = await parseFile(path);
    const hash = crypto.createHash("md5");

    var info = {
      trackid: generateTrackId(
        metadata.common.artist,
        metadata.common.title,
        metadata.common.album
      ),
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      album_id: hash
        .update(metadata.common.album)
        .digest("hex")
        .substring(0, 16),
      genre: "",
      copyright: "",
      length: sec2mmss(metadata.format.duration),
      track_number: 0,
      quality: "STD",
      file: path,
    };

    writeToIndex(info);
    storeImage(info.album_id, metadata.common.picture[0].data);
    console.log(`Index created: ${info.trackid} ${info.file}`);
  } catch (err) {
    console.error(err.message);
  }
};

parentPort.on("message", async (paths) => {
  const indexCreatePromises = paths.map((path) => indexCreate(path));
  await Promise.all(indexCreatePromises);
  parentPort.postMessage("done");
});
