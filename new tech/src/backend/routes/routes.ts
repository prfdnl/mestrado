import { Hono } from "hono"
export default new Hono()
  .basePath("/api")
  .route("/auth", (await import("./route.auth")).default)
  .route("/user", (await import("./route.user")).default)
  .route("/instituicao", (await import("./route.instituicao")).default)
  .route("/campus", (await import("./route.campus")).default)
  .route("/publicador", (await import("./route.publicador")).default)
  .route("/publicacao", (await import("./route.publicacao")).default)