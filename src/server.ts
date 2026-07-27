import frontend from "./frontend/index.html"
import { Hono } from "hono"

// BACKEND ROUTES
import routes from "./backend/routes/index.ts"
const app = new Hono()
app.route("/api", routes)

// SERVER
const { protocol, hostname, port } = Bun.serve({
  routes: { 
    "/api/*": app.fetch,
    "/*": frontend
  },
})

// THE USER MUST BE INFORMED…
console.log(`Server running at ${protocol}//${hostname}:${port}`)