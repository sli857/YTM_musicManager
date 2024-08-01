import Router from "koa-router";

import { dbConnection } from "../models/models.js";
import { decrypt, encrypt } from "../middlewares/secret.js";

const loginRouter = new Router();

loginRouter.prefix("/login");

loginRouter.post("/", async (ctx) => {
  try {
    const { name, secret } = ctx.request.body;

    if (!name || !secret) {
      ctx.status = 400;
      ctx.body = { status: 1, msg: "Name and secret are required." };
      return;
    }

    const decrypted = decrypt(secret);

    const User = dbConnection.collection("Users");
    const user = await User.findOne({ name: name, secret: decrypted });

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

export { loginRouter };
