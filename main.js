import Koa from "koa";
import Router from "koa-router";
import cors from "koa-cors";
import bodyParser from "koa-bodyparser";
import fs from "fs";
import { Library, User } from "./models.js";
import CryptoJS from "crypto-js";
const port = process.argv[2] || 3000;

function decrypt(str) {
  const bytes = CryptoJS.AES.decrypt(str, "Google2024Summer");
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

const app = new Koa();
const router = new Router();

router.get("/stream", async (ctx) => {
  try {
    const { trackid } = ctx.query;
    if (trackid) {
      const music = await Library.find({ trackid: trackid });
      if (music[0]) {
        const path = music[0].file;
        ctx.set({ "Content-Type": "audio/mp3" });
        ctx.status = 206;
        ctx.body = fs.createReadStream(path);
      } else {
        ctx.body = "music not found";
      }
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = "server error";
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
app.listen(port);
