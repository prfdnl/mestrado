import { Hono,  } from 'hono'
import { AuthController } from '../controllers/auth.controller'

export default new Hono()
  .post('/login', AuthController.login)
  .post('/refresh', AuthController.refresh)