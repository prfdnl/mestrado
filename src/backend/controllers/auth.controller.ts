import { UserDatabase } from '../database/user.database'
import { Context } from 'hono'
import PasswordService from '../services/Password.service'
import JwtService from '../services/Jwt.service'
import { getCookie, setCookie } from 'hono/cookie'

export class AuthController {
  static async login(c: Context) {
    const { name, password } = await c.req.json()
    if (!name || !password) 
      return c.json('Name and password are required', 400)
    const dbdata = await UserDatabase.getUserByName(name)
    if (!dbdata)
      return c.json('User not found', 404)
    const isPasswordValid = await PasswordService.verify(password, dbdata.password)
    if (!isPasswordValid)
      return c.json('Invalid password', 401)
    const token = await JwtService.sign({ id: dbdata.id, name: dbdata.name })
    // set cookies
    setCookie(c, 'token', token, { httpOnly: true, secure: true })
    return c.json(token, 200)
  }

  static async refresh(c: Context) {
    const token = getCookie(c, 'token')
    if (!token) return c.json('No token found', 401)
    const newToken = await JwtService.refresh(token)
    if (!newToken) return c.json('Invalid token', 401)
    setCookie(c, 'token', newToken, { httpOnly: true, secure: true })
    return c.json(newToken, 200)
  }
}