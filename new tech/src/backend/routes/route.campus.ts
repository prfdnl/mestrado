import { Hono } from "hono";
import { AuthMiddleware } from "../middlewares/middleware.auth";
import { GenericController } from "../controllers/controller._generic_";

const dbtable = "campus";
const dbcols = [ "id", "instituicao_id", "nome", "sigla", "endereco", "email", "telefone"];

export default new Hono()
  .get("/search/:query", AuthMiddleware.authenticate, GenericController.search(dbtable))
  .get("/", AuthMiddleware.authenticate, GenericController.getMany(dbtable, dbcols))
  .get("/:id", AuthMiddleware.authenticate, GenericController.getOneById(dbtable, dbcols))
  .post("/", AuthMiddleware.authenticate, GenericController.createOne(dbtable, dbcols))
  .patch("/:id", AuthMiddleware.authenticate, GenericController.patchOne(dbtable, dbcols))