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
    const user = dbConnection.collection("Users");
    const exist = await user.findOne({ name: name });

    if (exist) {
      ctx.status = 401;
      ctx.body = { status: 1, msg: "User already exists." };
      return;
    }

    const decrypted = decrypt(secret);
    const newUser = await user.insertOne({
      name: name,
      secret: decrypted,
    });
    ctx.status = 201;
    ctx.body = { status: 0, msg: "User registered successfully." };
    return;
  } catch (err) {
    ctx.status = 500;
    ctx.body = { status: 1, msg: "Internal server error." };
    console.log(err);
  }
});

export { signupRouter };
