import Koa from "koa";
import cors from "koa-cors";
import bodyParser from "koa-bodyparser";

import { KOA_PORT } from "./config/config.js";
import { streamRouter } from "./routers/streamRouter.js";
import { loginRouter } from "./routers/loginRouter.js";
import { signupRouter } from "./routers/signupRouter.js";

const app = new Koa();

app.use(cors()).use(bodyParser());
app.use(streamRouter.routes());
app.use(loginRouter.routes());
app.use(signupRouter.routes());
app.listen(KOA_PORT);
