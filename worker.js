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

const generateInfo = async (metadata, path) => {
  const hash = crypto.createHash("md5");
  return {
    trackid: generateTrackId(
      metadata.common.artist,
      metadata.common.title,
      metadata.common.album
    ),
    title: metadata.common.title,
    artist: metadata.common.artist,
    album: metadata.common.album,
    album_id: hash.update(metadata.common.album).digest("hex").substring(0, 16),
    genre: "",
    copyright: "",
    length: sec2mmss(metadata.format.duration),
    track_number: 0,
    quality: "STD",
    file: path,
  };
};

const indexCreate = async (path) => {
  try {
    const metadata = await parseFile(path);
    var info = await generateInfo(metadata, path);

    // async write to two files
    writeToIndex(info);
    storeImage(info.album_id, metadata.common.picture[0].data);

    console.log(`Index created: ${info.trackid} ${info.file}`);
  } catch (err) {
    console.error(err.message);
  }
};

// TODO: update === logic
const checkExist = async (path, lib) => {
  const metadata = await parseFile(path);
  const info = await generateInfo(metadata, path);
  const exist = lib.some(
    (item) => JSON.stringify(item) === JSON.stringify(info)
  );
  return [exist, exist ? null : info];
};

parentPort.on("message", async (message) => {
  switch (message.task) {
    case "init":
      const indexCreatePromises = message.job.map((path) => indexCreate(path));
      await Promise.all(indexCreatePromises);
      parentPort.postMessage({ status: "done" });
      break;
    case "update":
      var toAdd = [];
      const indexUpdatePromises = message.job.map(async (path) => {
        const [exist, info] = await checkExist(path, message.lib);
        if (!exist) {
          toAdd.push(info);
        }
      });
      await Promise.all(indexUpdatePromises);
      parentPort.postMessage({ status: "update", toAdd: toAdd });
      break;
    default:
      parentPort.postMessage({ error: "Unknown task" });
  }
});
