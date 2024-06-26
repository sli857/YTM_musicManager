const Koa = require("koa");
const jwt = require("koa-jwt");
const axios = require("axios");
const musicMetadata = import("music-metadata");
const jpeg = require("jpeg-js");

const app = new Koa();

app.use(async (ctx) => {
  ctx.body = "Hello World";
});
app.listen(3000);
