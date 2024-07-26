import Router from "koa-router";
import fs from "fs";
import stream from "koa-stream";
const testStreamRouter = new Router();

testStreamRouter.prefix("/testStream");
testStreamRouter.get("/", async (ctx) => {
  console.log(ctx);
  await stream.file(ctx, "./Library/二十二.mp3", { allowDownload: true });
});

export { testStreamRouter };
