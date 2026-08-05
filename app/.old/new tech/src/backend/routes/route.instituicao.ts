import { Hono } from "hono";
import { AuthMiddleware } from "../middlewares/middleware.auth";
import { GenericController } from "../controllers/controller._generic_";

const dbtable = "instituicoes";
const dbcols = ["nome", "cnpj", "endereco", "sigla", "telefone", "email"];

export default new Hono()

  .get("/:instituicao_id/campus",
    AuthMiddleware.authenticate, 
    GenericController.getManyByColumn("campus", ["id", "nome", "sigla", "endereco", "email", "telefone", "cnpj"], "instituicao_id")  )

  .get("/search/:query",
    AuthMiddleware.authenticate, 
    GenericController.search(dbtable))

  .get("/",
    AuthMiddleware.authenticate, 
    GenericController.getMany(dbtable, ["id", ...dbcols]))

  .get("/:id", 
    AuthMiddleware.authenticate, 
    GenericController.getOneById(dbtable, dbcols))

  .post("/",
    AuthMiddleware.authenticate,
    AuthMiddleware.adminOnly,
    GenericController.createOne(dbtable, dbcols))

  .patch("/:id", 
    AuthMiddleware.authenticate, 
    AuthMiddleware.adminOnly,
    GenericController.patchOne(dbtable, dbcols))
