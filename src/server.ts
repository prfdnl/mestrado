import backendRoutes from "./backend/routes/routes"
import { websocket, handleWebSocketUpgrade } from "./backend/chat/chat"

import index from "./frontend/index.html"
import login from "./frontend/login.html"

const { url } = Bun.serve({
  routes: {
    "/api/*": backendRoutes.fetch,
    "/api/chat": handleWebSocketUpgrade,
    "/login": login,
    "/*": index
  },
  websocket
})

console.log(`Server started on ${url}`)

// --- CHRON JOBS ------------------------------------------------------------------------------------------------------

import "./backend/cron/cron"