import { Hono } from "hono"
import { type } from "arktype"
import { InputMiddleware } from "../middlewares/middleware.input"
import { DatabaseMiddleware } from "../middlewares/middleware.database"
import { AuthController } from "../controllers/controller.auth"
import { AuthMiddleware } from "../middlewares/middleware.auth"

export default new Hono()
  .basePath("/api")

  // --- USER ----------------------------------------------------------------------------------------------------------

  .post('/2/user',
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ username: "string", password: "string" })),
    DatabaseMiddleware.inputBodyOnly,
    DatabaseMiddleware.inputPasswordToPasswordHash,
    DatabaseMiddleware.insert({ table: "user", returning: ["id", "username", "roles"] }),
    DatabaseMiddleware.index({ index: "user", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .patch('/2/user/:id',
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ "username?" : "string", "password?" : "string" })),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.inputPasswordToPasswordHash,
    DatabaseMiddleware.patch({ table: "user", returning: ["id", "username", "roles"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "user", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get('/2/user',
    AuthController.isAdmin,
    DatabaseMiddleware.inputBodyOnly,
    DatabaseMiddleware.select({ table: "user", columns: ["id", "username", "roles"], where: [] }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get('/2/user/search/:query',
    AuthController.isAdmin,
    DatabaseMiddleware.search({ index: "user" }),
    c => c.json(c.get<any>("searchResult"))
  )

  // --- AUTHENTICATION ------------------------------------------------------------------------------------------------

  .post('/2/login', ...AuthController.login)
  .all('/2/logout', ...AuthController.logout)
  .all('/2/refresh-token', ...AuthController.refreshToken)

  // --- INSTITUIÇÃO ---------------------------------------------------------------------------------------------------

  .post("/2/instituicao",
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ 
      nome    : "string",
      cnpj    : "string",
      endereco: "string",
      sigla   : "string",
      telefone: "string",
      email   : "string.email"
    })),
    DatabaseMiddleware.inputBodyOnly,
    DatabaseMiddleware.insert({ table: "instituicao", returning: ["id", "nome", "cnpj", "endereco", "sigla", "telefone", "email"] }),
    DatabaseMiddleware.index({ index: "instituicao", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .patch("/2/instituicao/:id",
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ 
      "nome?"    : "string",
      "cnpj?"    : "string",
      "endereco?": "string",
      "sigla?"   : "string",
      "telefone?": "string",
      "email?"   : "string.email"
    })),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.patch({ table: "instituicao", returning: ["id", "nome", "cnpj", "endereco", "sigla", "telefone", "email"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "instituicao", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .delete("/2/instituicao/:id",
    AuthController.isAdmin,
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.deleteOne({ table: "instituicao", where: ["id"] }),
    DatabaseMiddleware.indexDelete({ index: "instituicao", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/2/instituicao/search/:query",
    AuthController.isAdmin,
    DatabaseMiddleware.search({ index: "instituicao" }),
    c => c.json(c.get<any>("searchResult"))
  )

  // --- INSTITUIÇÃO -> CAMPUS -----------------------------------------------------------------------------------------

  .post("/2/instituicao/:instituicao_id/campus",
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ 
      nome    : "string",
      cnpj    : "string",
      endereco: "string",
      sigla   : "string",
      telefone: "string",
      email   : "string.email",
    })),
    InputMiddleware.paramsValidate(type({ instituicao_id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.insert({ table: "campus", returning: ["id", "nome", "sigla", "endereco", "email", "telefone", "cnpj"] }),
    DatabaseMiddleware.index({ index: "campus", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .patch("/2/instituicao/:instituicao_id/campus/:id",
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ 
      "nome?"    : "string",
      "cnpj?"    : "string",
      "endereco?": "string",
      "sigla?"   : "string",
      "telefone?": "string",
      "email?"   : "string.email"
    })),
    InputMiddleware.paramsValidate(type({ instituicao_id: "string.uuid", id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.patch({ table: "campus", returning: ["id", "nome", "sigla", "endereco", "email", "telefone", "cnpj"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "campus", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .delete("/2/instituicao/:instituicao_id/campus/:id",
    AuthController.isAdmin,
    InputMiddleware.paramsValidate(type({ instituicao_id: "string.uuid", id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.deleteOne({ table: "campus", where: ["id"] }),
    DatabaseMiddleware.indexDelete({ index: "campus", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/2/instituicao/:instituicao_id/campus",
    AuthController.isAdmin,
    InputMiddleware.paramsValidate(type({ instituicao_id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.select({ table: "campus", columns: ["id", "instituicao_id",  "nome", "sigla", "endereco", "email", "telefone", "cnpj"], where: ["instituicao_id"] }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/2/campus/search/:query",
    AuthController.isAdmin,
    DatabaseMiddleware.search({ index: "campus" }),
    c => c.json(c.get<any>("searchResult"))
  )

  // --- PUBLICADOR ----------------------------------------------------------------------------------------------------

  .patch("/2/publicador/:id",
    AuthMiddleware.authenticate,
    AuthMiddleware.userOwnership("id"),
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ 
      nome     : "string",
      email    : "string.email",
      campus_id: "string.uuid",
      telefone : "string",
      descricao: "string"
    })),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.patch({ table: "user", returning: ["id", "nome", "email", "campus_id", "telefone"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "publicador", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/2/publicador/:id/disable",
    AuthMiddleware.authenticate,
    AuthMiddleware.userOwnership("id"),
    async (c, n) => {
      c.set<any>("databaseInput", { active: false, id: c.get<any>("user").id })
      return await n()
    },
    DatabaseMiddleware.patch({ table: "user", returning: ["id", "nome", "email", "campus_id", "telefone", "active"], where: ["id"] }),
    DatabaseMiddleware.indexDelete({ index: "publicador", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  // -------------------------------------------------------------------------------------------------------------------1