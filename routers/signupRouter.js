import Router from "koa-router";

import { User } from "../models/models.js";
import { decrypt, encrypt } from "../middlewares/secret.js";

const signupRouter = new Router();

signupRouter.post("/signup", async (ctx) => {
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

export { signupRouter };
