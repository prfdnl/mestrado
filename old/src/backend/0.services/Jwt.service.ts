import { decode, sign, verify } from 'hono/jwt'
import { JwtTokenInvalid, type JWTPayload } from 'hono/utils/jwt/types'

const SECRET = process.env.JWT_SECRET || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

export default new class JwtService {
  async sign(payload: JWTPayload) {
    payload.exp = (Math.floor(Date.now() / 1000) + 60 * 60)
    const token = await sign(payload, SECRET, "HS256")
    delete payload.exp
    delete payload.iat
    delete payload.password
    return { token, payload }
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
    const { iat, exp, ...rest } = payload
    return this.sign(rest)
  }
}