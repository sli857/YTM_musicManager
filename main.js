import Koa from "koa";
import Router from "koa-router";
import cors from "koa-cors";
import bodyParser from "koa-bodyparser";
import fs from "fs";
import path from "path";

import { Library, User } from "./models.js";
import { decrypt, encrypt } from "./middlewares/secret.js";
import { KOA_PORT } from "./config/config.js";

const app = new Koa();
const router = new Router();

router.get("/stream", async (ctx) => {
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

router.post("/login", async (ctx) => {
  try {
    const { name, secret } = ctx.request.body;

    if (!name || !secret) {
      ctx.status = 400;
      ctx.body = { status: 1, msg: "Name and secret are required." };
      return;
    }

    const decrypted = decrypt(secret);

    const user = await User.findOne({ name: name, secret: decrypted }).exec();

    console.log(user);
    if (user) {
      ctx.status = 200;
      ctx.body = { status: 0, msg: "Success" };
    } else {
      ctx.status = 401;
      ctx.body = { status: 1, msg: "Username or Password error." };
    }
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { status: 1, msg: "Internal Server Error" };
  }
});

router.post("/signup", async (ctx) => {
  try {
    const { name, secret } = ctx.request.body;
    if (!name || !secret) {
      ctx.status = 400;
      ctx.body = { status: 1, msg: "Name and secret are required." };
      return;
    }
    const decrypted = decrypt(secret);

    const newUser = new User({
      name: name,
      secret: decrypted,
    });

    await newUser.save();
    ctx.status = 200;
    ctx.body = { status: 0, msg: "Success" };
  } catch (err) {
    ctx.status = 401;
    ctx.body = { status: 1, msg: "User Already Exists." };
    console.log(err);
  }
});

app.use(cors());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods);
app.listen(KOA_PORT);
