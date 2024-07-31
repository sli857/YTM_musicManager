import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "@koa/bodyparser";

import { KOA_PORT } from "./config/config.js";
import { streamRouter } from "./routers/streamRouter.js";
import { loginRouter } from "./routers/loginRouter.js";
import { signupRouter } from "./routers/signupRouter.js";
import { libraryLoad } from "./utils/musicManager.js";
import { dbInit } from "./utils/initDB.js";

await libraryLoad("./Library/index.json");
await dbInit("./Library/index.json");

const app = new Koa();

app.use(cors());
app.use(bodyParser());
app.use(streamRouter.routes());
app.use(loginRouter.routes());
app.use(signupRouter.routes());
app.listen(KOA_PORT, () => {
  console.log(`\nServer is running on port: ${KOA_PORT}`);
});
