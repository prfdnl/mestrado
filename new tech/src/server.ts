import { Hono } from "hono"
import routes from "./backend/routes/main"

const api = new Hono()
  .route("/api", routes)

const { url } = Bun.serve({
  routes: {
    "/api/*": api.fetch,
    "/*": Response.json("Not Found", { status: 404 })
  }
})

console.log(`Server started on ${url}`)