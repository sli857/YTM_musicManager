import Router from "koa-router";

import { dbConnection } from "../models/models.js";
import { decrypt, encrypt } from "../middlewares/secret.js";

const signupRouter = new Router();

signupRouter.prefix("/signup");

signupRouter.post("/", async (ctx) => {
  try {
    const { name, secret } = ctx.request.body;
    if (!name || !secret) {
      ctx.status = 400;
      ctx.body = { status: 1, msg: "Name and secret are required." };
      return;
    }
    const decrypted = decrypt(secret);
    const user = dbConnection.collection("Users");
    if (
      user.indexExists({
        name: name,
      })
    ) {
      ctx.status = 401;
      ctx.body = { status: 1, msg: "User Already Exists." };
      return;
    }
    user.insertOne({
      name: name,
      secret: decrypted,
    });
    ctx.status = 200;
    ctx.body = { status: 0, msg: "Success" };
  } catch (err) {
    console.log(err);
  }
});

export { signupRouter };
