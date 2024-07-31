import router from "koa-router";
import { metadataRouter } from "./metadataRouter.js";
import { streamRouter } from "./streamRouter.js";
import { loginRouter } from "./loginRouter.js";
import { signupRouter } from "./signupRouter.js";

const routers = new router();

routers.use(loginRouter.routes());
routers.use(signupRouter.routes());
routers.use(metadataRouter.routes());
routers.use(streamRouter.routes());
export { routers };
