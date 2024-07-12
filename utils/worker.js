import { parentPort } from "worker_threads";
import { parseFile } from "music-metadata";
import fs from "fs";
import crypto from "crypto";
import jpeg from "jpeg-js";

const storeImage = async (album_id, image) => {
  if (fs.existsSync(`./Library/${album_id}.jpg`)) {
    console.log(
      `Skipped album ${album_id}: Cover image has already been stored.`
    );
    return;
  }
  // screen out non-jpeg images for now
  if (image[0].data[0] !== 0xff || image[0].data[1] !== 0xd8) {
    return;
  }

  const raw = jpeg.decode(image[0].data, { useTArray: true });
  const data = jpeg.encode(raw, 100);

  fs.writeFile(`./Library/${album_id}.jpg`, data.data, (err) => {
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

const getArtists = (list) => {
  const delimiters = [",", "|", ";", "\t", "\n"];
  for (const deli of delimiters) {
    const artists = list.split(deli);
    if (artists.length > 1) {
      return artists.map((e) => e.trim());
    }
  }

  // no delimiter found
  return [list];
};

const generateInfo = async (metadata, path) => {
  const hash = crypto.createHash("md5");
  const artists = await getArtists(metadata.common.artist);
  return {
    trackid: generateTrackId(
      metadata.common.artist,
      metadata.common.title,
      metadata.common.album
    ),
    title: metadata.common.title,
    artist: artists,
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
    storeImage(info.album_id, metadata.common.picture);

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
