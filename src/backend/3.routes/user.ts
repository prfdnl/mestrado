import { Hono, } from 'hono'
import { authMiddleware } from '../0.middleware/auth.middleware'
import { UserController } from '../2.controllers/user.controller'

export default new Hono()
  .get('/:id', authMiddleware, UserController.getById)
  .post('/', UserController.createUser)