import { UserDatabase } from '../1.database/user.database'
import { Context } from 'hono'
import PasswordService from '../0.services/Password.service'
import JwtService from '../0.services/Jwt.service'
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
    const data = await JwtService.sign(dbdata)
    // set cookies
    setCookie(c, 'token', data.token, { httpOnly: true, secure: true })
    return c.json(data, 200)
  }

  static async refresh(c: Context) {
    const token = getCookie(c, 'token')
    if (!token) return c.json('No token found', 401)
    const data = await JwtService.refresh(token)
    if (!data) return c.json('Invalid token', 401)
    setCookie(c, 'token', data.token, { httpOnly: true, secure: true })
    return c.json(data, 200)
  }
}