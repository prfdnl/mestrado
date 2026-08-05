import frontend from "./frontend/index.html"
import frontendLogin from "./frontend/login.html"
import { Hono } from "hono"

// BACKEND ROUTES
import routes from "./backend/3.routes/index.ts"
const app = new Hono()
app.route("/api", routes)

// SERVER
const { protocol, hostname, port } = Bun.serve({
  routes: { 
    "/api/*": app.fetch,
    "/login": frontendLogin,
    "/*": frontend
  },
})

// THE USER MUST BE INFORMED…
console.log(`Server running at ${protocol}//${hostname}:${port}`)