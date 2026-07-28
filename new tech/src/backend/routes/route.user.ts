import { Hono } from "hono";
import { UserController } from "../controllers/controller.user";

export default new Hono()
  .get("/:id", UserController.getUserById)
  .post("/", UserController.createUser)
  .patch("/:id", UserController.patchUser);
  