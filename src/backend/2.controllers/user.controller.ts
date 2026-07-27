import { UserDatabase } from '../1.database/user.database'
import { Context } from 'hono'

export namespace UserController {
  export async function getById(c: Context) {
    const idParam = c.req.param('id')
    if (!idParam)
      return c.json('Invalid user id', 400)
    const id = parseInt(idParam)
    const user = await UserDatabase.getUserById(id)
    if (!user) 
      return c.json('Not Found', 404)
    delete user.password // garante que nunca nunca sera retornada a senha do usuario
    return c.json(user)
  }

  export async function createUser(c: Context) {
    const { name, password } = await c.req.json()
    if (!name || !password) 
      return c.json('Name and password are required', 400)
    try {
      const user = await UserDatabase.createUser(name, password)
      delete user.password // garante que nunca nunca sera retornada a senha do usuario
      return c.json(user, 201)
    } catch (error: any) {
      if (error.name === 'CreateUserErrorDuplicate') 
        return c.json('User already exists', 409)
      return c.json('Internal Server Error', 500)
    }
  }
}