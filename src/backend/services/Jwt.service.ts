import { decode, sign, verify } from 'hono/jwt'
import { JwtTokenInvalid, type JWTPayload } from 'hono/utils/jwt/types'

const SECRET = process.env.JWT_SECRET || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

export default new class JwtService {
  async sign(payload: JWTPayload) {
    return await sign(payload, SECRET, "HS256")
  }

  async verify(token: string,) {
    try {
      return await verify(token, SECRET, "HS256")
    } catch (error) {
      if (error instanceof JwtTokenInvalid)
        return null
      throw error
    }
  }

  async decode(token: string) {
    return decode(token)
  }

  async refresh(token: string) {
    const payload = await this.verify(token)
    if (!payload) return null
    return await this.sign(payload)
  }
}