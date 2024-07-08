import Koa from "koa";
import Router from "koa-router";
import cors from "koa-cors";
import bodyParser from "koa-bodyparser";
import fs from "fs";
import { Library, User } from "./models.js";

const port = process.argv[2] || 3000;

const app = new Koa();
const router = new Router();

router.get("/stream", async (ctx) => {
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
});

router.post("/login", async (ctx) => {
  console.log(ctx.request.body);
});

router.post("/signup", async (ctx) => {
  try {
    const newUser = new User({
      name: ctx.request.body.name,
      secret: ctx.request.body.secret,
    });

    await newUser.save();
    ctx.body = { status: 0, msg: "Success" };
  } catch (err) {
    ctx.body = { status: 1, msg: "User Already Exists." };
    console.log(err);
  }
});

app.use(cors());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods);
app.listen(port);
