import { Hono } from "hono"
export default new Hono()
  .route("/auth", (await import("./route.auth")).default)
  .route("/user", (await import("./route.user")).default)
  .route("/instituicao", (await import("./route.instituicao")).default)