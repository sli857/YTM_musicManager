import Router from "koa-router";
import fs from "fs";
import stream from "koa-stream";
const testStreamRouter = new Router();

testStreamRouter.prefix("/testStream");
testStreamRouter.get("/", async (ctx) => {
  const music = "./Library/二十二.mp3";
  const stat = fs.statSync(music);
  const range = ctx.req.headers.range;
  var readStream;
  if (range !== undefined) {
    const parts = range.replace(`bytes=`, "").split("-");
    const partial_start = parts[0];
    const partial_end = parts[1];

    if (
      (isNaN(partial_start) && partial_start.length > 1) ||
      (isNaN(partial_end) && partial_end.length > 1)
    ) {
      return (ctx.status = 500);
    }

    const start = parseInt(partial_start, 10);
    const end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
    const content_length = end - start + 1;

    ctx.status = 206;
    ctx.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": content_length,
      "Content-Range": "bytes " + start + "-" + end + "/" + stat.size,
    });
    readStream = fs.createReadStream(music, { start, end });
  } else {
    ctx.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": stat.size,
    });
    readStream = fs.createReadStream(music);
  }
  ctx.body = readStream;
});

export { testStreamRouter };
