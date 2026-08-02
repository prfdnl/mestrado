import backendRoutes from "./backend/routes/routes"

import index from "./frontend/index.html"
import login from "./frontend/login.html"

const { url } = Bun.serve({
  routes: {
    "/api/*": backendRoutes.fetch,
    "/login": login,
    "/*": index
  }
})

console.log(`Server started on ${url}`)

// CHRON JOBS
import { startCronJob } from "./cron"
startCronJob()