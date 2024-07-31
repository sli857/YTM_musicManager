import Router from "koa-router";
import { dbConnection } from "../models/models.js";

const metadataRouter = new Router();

metadataRouter.prefix("/metadata");
metadataRouter.get("/playlists", async (ctx) => {
  try {
    const Playlists = dbConnection.collection("Playlists");
    const playlists = await Playlists.find().toArray();
    ctx.status = 200;
    ctx.body = { status: 0, playlists };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { status: 1, msg: "Internal Server Error" };
  }
});

export { metadataRouter };
