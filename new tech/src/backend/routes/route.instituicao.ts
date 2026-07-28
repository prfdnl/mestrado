import { Hono } from "hono";
import { AuthMiddleware } from "../middlewares/middleware.auth";
import { GenericController } from "../controllers/controller._generic_";

const dbcols = ["nome", "cnpj", "endereco", "sigla", "telefone", "email"];

export default new Hono()
  .get("/", AuthMiddleware.authenticate, GenericController.getMany("instituicoes", ["id", ...dbcols]))
  .get("/:id", AuthMiddleware.authenticate, GenericController.getOneById("instituicoes", dbcols))
  .post("/", AuthMiddleware.authenticate, GenericController.createOne("instituicoes", dbcols))
  .patch("/:id", AuthMiddleware.authenticate, GenericController.patchOne("instituicoes", dbcols))