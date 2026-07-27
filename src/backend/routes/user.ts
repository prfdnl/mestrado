import { Hono, } from 'hono'
import { authMiddleware } from '../middleware/auth.middleware'
import { UserController } from '../controllers/user.controller'

export default new Hono()
  .get('/:id', authMiddleware, UserController.getById)
  .post('/', UserController.createUser)