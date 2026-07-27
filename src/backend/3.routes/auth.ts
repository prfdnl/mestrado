import { Hono,  } from 'hono'
import { AuthController } from '../2.controllers/auth.controller'

export default new Hono()
  .post('/login', AuthController.login)
  .all('/refresh', AuthController.refresh)