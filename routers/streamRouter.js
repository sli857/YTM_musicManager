import Router from "koa-router";
import fs from "fs";
import path from "path";

import { Library } from "../models/models.js";
const streamRouter = new Router();

streamRouter.prefix("/stream");

streamRouter.get("/", async (ctx) => {
  try {
    const { trackid } = ctx.query;
    if (!trackid) {
      ctx.status = 400;
      ctx.body = "Track ID is required";
      return;
    }

    const music = await Library.findOne({ trackid: trackid });
    if (!music) {
      ctx.status = 404;
      ctx.body = "Music not found";
      return;
    }

    const filePath = path.resolve(music.file);
    if (!fs.existsSync(filePath)) {
      ctx.status = 404;
      ctx.body = "File not found";
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = ctx.headers.range;

    if (range) {
      const parts = range.replace(`bytes=`, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        ctx.status = 416;
        ctx.set("Content-Range", `bytes */${fileSize}`);
        return;
      }

      ctx.status = 206;
      ctx.set({
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "audio/mp3",
      });

      ctx.body = fs.createReadStream(filePath, { start, end });
    } else {
      ctx.status = 200;
      ctx.set({
        "Content-Length": fileSize,
        "Content-Type": "audio/mp3",
      });

      ctx.body = fs.createReadStream(filePath);
    }
  } catch (err) {
    console.error("Error while streaming:", err);
    ctx.status = 500;
    ctx.body = "Server error";
  }
});

export { streamRouter };
