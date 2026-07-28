import { Hono } from "hono";
import { AuthController } from "../controllers/controller.auth";
import { AuthMiddleware } from "../middlewares/middleware.auth";

export default new Hono()
  .post("/login", AuthController.login)
  .post("/refresh", AuthController.refreshToken)
  .all('/check', AuthMiddleware.authenticate, (c) => c.json(c.get<any>("user")));