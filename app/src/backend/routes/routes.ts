import { Hono } from "hono"
import { type } from "arktype"
import { InputMiddleware } from "../middlewares/middleware.input"
import { DatabaseMiddleware } from "../middlewares/middleware.database"
import { AuthController } from "../controllers/controller.auth"
import { AuthMiddleware } from "../middlewares/middleware.auth"
import { downloadMedia } from "../cron/1.download"

export default new Hono()
  .basePath("/api")

  // --- USER ----------------------------------------------------------------------------------------------------------

  .post('/user',
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ username: "string", password: "string" })),
    DatabaseMiddleware.inputBodyOnly,
    DatabaseMiddleware.inputPasswordToPasswordHash,
    DatabaseMiddleware.insert({ table: "user", returning: ["id", "username", "roles"] }),
    DatabaseMiddleware.index({ index: "user", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .patch('/user/:id',
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ "username?": "string", "password?": "string" })),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.inputPasswordToPasswordHash,
    DatabaseMiddleware.patch({ table: "user", returning: ["id", "username", "roles"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "user", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get('/user',
    AuthController.isAdmin,
    DatabaseMiddleware.inputBodyOnly,
    DatabaseMiddleware.select({ table: "user", columns: ["id", "username", "roles"], where: [] }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get('/user/search/:query',
    AuthController.isAdmin,
    DatabaseMiddleware.search({ index: "user" }),
    c => c.json(c.get<any>("searchResult"))
  )

  // --- AUTHENTICATION ------------------------------------------------------------------------------------------------

  .post('/login', ...AuthController.login)
  .all('/logout', ...AuthController.logout)
  .all('/refresh-token', ...AuthController.refreshToken)

  // --- INSTITUIÇÃO ---------------------------------------------------------------------------------------------------

  .post("/instituicao",
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({
      nome: "string",
      cnpj: "string",
      endereco: "string",
      sigla: "string",
      telefone: "string",
      email: "string.email"
    })),
    DatabaseMiddleware.inputBodyOnly,
    DatabaseMiddleware.insert({ table: "instituicao", returning: ["id", "nome", "cnpj", "endereco", "sigla", "telefone", "email"] }),
    DatabaseMiddleware.index({ index: "instituicao", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .patch("/instituicao/:id",
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({
      "nome?": "string",
      "cnpj?": "string",
      "endereco?": "string",
      "sigla?": "string",
      "telefone?": "string",
      "email?": "string.email"
    })),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.patch({ table: "instituicao", returning: ["id", "nome", "cnpj", "endereco", "sigla", "telefone", "email"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "instituicao", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .delete("/instituicao/:id",
    AuthController.isAdmin,
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.deleteOne({ table: "instituicao", where: ["id"] }),
    DatabaseMiddleware.indexDelete({ index: "instituicao", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/instituicao/:id",
    AuthController.isAdmin,
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.select({ table: "instituicao", columns: ["id", "nome", "cnpj", "endereco", "sigla", "telefone", "email"], where: ["id"] }),
    c => c.json(c.get<any>("databaseResult")[0] || null)
  )

  .get("/instituicao/:instituicao_id/campus",
    AuthController.isAdmin,
    InputMiddleware.paramsValidate(type({ instituicao_id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.select({ table: "campus", columns: ["id", "instituicao_id", "nome", "sigla", "endereco", "email", "telefone", "cnpj"], where: ["instituicao_id"] }),
    c => c.json(c.get<any>("databaseResult"))
  )


  .get("/instituicao/search/:query",
    AuthController.isAdmin,
    DatabaseMiddleware.search({ index: "instituicao" }),
    c => c.json(c.get<any>("searchResult"))
  )

  // --- INSTITUIÇÃO -> CAMPUS -----------------------------------------------------------------------------------------

  .post("/campus",
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({
      nome: "string",
      instituicao_id: "string.uuid",
      cnpj: "string",
      endereco: "string",
      sigla: "string",
      telefone: "string",
      email: "string.email",
    })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.insert({ table: "campus", returning: ["id", "nome", "sigla", "endereco", "email", "telefone", "cnpj"] }),
    DatabaseMiddleware.index({ index: "campus", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .patch("/campus/:id",
    AuthController.isAdmin,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({
      "nome?": "string",
      "instituicao_id?": "string.uuid",
      "cnpj?": "string",
      "endereco?": "string",
      "sigla?": "string",
      "telefone?": "string",
      "email?": "string.email"
    })),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.patch({ table: "campus", returning: ["id", "nome", "sigla", "endereco", "email", "telefone", "cnpj"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "campus", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .delete("/campus/:id",
    AuthController.isAdmin,
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.deleteOne({ table: "campus", where: ["id"] }),
    DatabaseMiddleware.indexDelete({ index: "campus", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/campus/:id",
    AuthController.isAdmin,
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.select({ table: "campus", columns: ["id", "instituicao_id", "nome", "sigla", "endereco", "email", "telefone", "cnpj"], where: ["id"] }),
    c => c.json(c.get<any>("databaseResult")[0] || null)
  )

  .get("/campus/search/:query",
    AuthController.isAdmin,
    DatabaseMiddleware.search({ index: "campus" }),
    c => c.json(c.get<any>("searchResult"))
  )

  // --- PUBLICADOR ----------------------------------------------------------------------------------------------------

  .patch("/publicador/:id",
    AuthMiddleware.authenticate,
    AuthMiddleware.userOwnership("id"),
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({
      nome: "string",
      email: "string.email",
      campus_id: "string.uuid",
      telefone: "string",
      descricao: "string"
    })),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.patch({ table: "user", returning: ["id", "nome", "email", "campus_id", "telefone"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "publicador", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/publicador/:id",
    AuthMiddleware.authenticate,
    AuthMiddleware.userOwnership("id"),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.select({ table: "user", columns: ["id", "nome", "email", "campus_id", "telefone", "descricao"], where: ["id"] }),
    c => c.json(c.get<any>("databaseResult")[0] || null)
  )

  .get("/publicador/:id/publicacao",
    AuthMiddleware.authenticate,
    AuthMiddleware.userOwnership("id"),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.select({
      table: "publicacao", columns: ["id", "user_id", "titulo", "tipo", "resumo_curto", "transcricao", "link", "data"], where: ["publicador_id"]
    }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/publicador/search/:query",
    AuthMiddleware.authenticate,
    AuthMiddleware.adminOnly,
    DatabaseMiddleware.search({ index: "publicador" }),
    c => c.json(c.get<any>("searchResult"))
  )

  .get("/publicador/:id/disable",
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

  // --- PUBLICAÇÔES ---------------------------------------------------------------------------------------------------

  .post("/publicacao",
    AuthMiddleware.authenticate,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({
      user_id    : "string.uuid",
      titulo     : "string",
      // tipo       : "string",
      // transcricao: "string",
      // resumo     : "string",
      // analise    : "string",
      link       : "string.url",
      "data?"    : "string.date"
    })),
    DatabaseMiddleware.inputBodyOnly,
    DatabaseMiddleware.insert({ table: "publicacao", returning: ["id", "user_id", "id", "user_id", "titulo", "tipo", "resumo", "transcricao", "link", "data"] }),
    DatabaseMiddleware.index({ index: "publicacao", id: "id" }),
    async (c, next) => {
      const id = c.get<any>("databaseResult")?.id
      const url = c.get<any>("databaseResult")?.link
      downloadMedia(url, id)
      return await next()
    },
    c => c.json(c.get<any>("databaseResult"))
  )

  .patch("/publicacao/:id",
    AuthMiddleware.authenticate,
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({
      "user_id?"    : "string.uuid",
      "titulo?"     : "string",
      "tipo?"       : "string",
      "transcricao?": "string",
      "resumo?"     : "string",
      "link?"       : "string.url",
      "data?"       : "string.date"
    })),
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputMergeParamsAndBody,
    DatabaseMiddleware.patch({ table: "publicacao", returning: ["id", "user_id", "titulo", "tipo", "transcricao", "resumo", "link"], where: ["id"] }),
    DatabaseMiddleware.indexUpdate({ index: "publicacao", id: "id" }),
    async (c, next) => {
      const id = c.get<any>("databaseResult")?.id
      const url = c.get<any>("databaseResult")?.link
      downloadMedia(url, id)
      return await next()
    },
    c => c.json(c.get<any>("databaseResult"))
  )

  .delete("/publicacao/:id",
    AuthMiddleware.authenticate,
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.deleteOne({ table: "publicacao", where: ["id"] }),
    (c, next) => {
      const id = c.get<any>("databaseInput")?.id
      // stopDownloadYt(id)
      // stopTranscription(id)
      // stopSummarization(id)
      // removeFile(id)
      return next()
    },
    DatabaseMiddleware.indexDelete({ index: "publicacao", id: "id" }),
    c => c.json(c.get<any>("databaseResult"))
  )

  .get("/publicacao/:id",
    InputMiddleware.paramsValidate(type({ id: "string.uuid" })),
    DatabaseMiddleware.inputParamsOnly,
    DatabaseMiddleware.select({ table: "publicacao", columns: ["id", "user_id", "titulo", "tipo", "transcricao", "resumo", "link"], where: ["id"] }),
    c => c.json(c.get<any>("databaseResult")[0] || null)
  )

  .get("/publicacao/search/:query",
    AuthMiddleware.authenticate,
    AuthMiddleware.adminOnly,
    DatabaseMiddleware.search({ index: "publicacao" }),
    c => c.json(c.get<any>("searchResult"))
  )
