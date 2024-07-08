import Koa from "koa";
import Router from "koa-router";
import fs from "fs";
import { Library } from "./models.js";

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

app.use(router.routes());
app.listen(port);
