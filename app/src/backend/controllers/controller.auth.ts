import { getCookie, setCookie } from "hono/cookie";
import { PasswordService } from "../services/service.password";
import { JWTService } from "../services/service.jwt";

import { InputMiddleware } from "../middlewares/middleware.input";
import { DatabaseMiddleware } from "../middlewares/middleware.database";

import { type } from "arktype";
import type { Handler } from "hono";


export namespace AuthController {
  export const login = [
    InputMiddleware.jsonBodyParse,
    InputMiddleware.jsonBodyValidate(type({ username: "string", password: "string" })),
    DatabaseMiddleware.inputBodyOnly,
    DatabaseMiddleware.inputPasswordToPasswordHash,
    DatabaseMiddleware.select({ table: "user", columns: ["id", "username", "password_hash", "roles", "active"], where: ['username'] }),
    async (c) => {
      const dbData = c.get<any>("databaseResult")[0]
      if (!dbData) return c.json({ message: "User not found" }, 404)
      if (!dbData.active) return c.json({ message: "User is not active" }, 401)
      const inpData = c.get<any>("validatedJsonBody")
      const passMatch = await PasswordService.verify(inpData.password, dbData.password_hash)
      if (!passMatch) return c.json({ message: "Invalid password" }, 401)
      const token = await JWTService.generate({ id: dbData.id, username: dbData.username, roles: dbData.roles })
      setCookie(c, "refresh_token", token.token, { httpOnly: true, secure: true, sameSite: "strict" })
      return c.json(token)
    }
  ] as const satisfies Handler[]

  export const refreshToken = [
    async (c) => {
      const refreshToken = getCookie(c, "refresh_token")
      if (!refreshToken) return c.json({ message: "No refresh token provided" }, 401)
      const payload = await JWTService.verify(refreshToken)
      if (!payload) return c.json({ message: "Invalid refresh token" }, 401)
      const jwtData = await JWTService.refresh(refreshToken)
      if (!jwtData) return c.json({ message: "Failed to refresh token" }, 500)
      setCookie(c, "refresh_token", jwtData.token, { httpOnly: true, secure: true, sameSite: "strict" })
      return c.json(jwtData)
    }
  ] as const satisfies Handler[]

  export const logout = [
    async (c) => {
      setCookie(c, "refresh_token", "", { httpOnly: true, secure: true, sameSite: "strict", maxAge: 0 })
      return c.json({ message: "Logged out" })
    }
  ] as const satisfies Handler[]

  export const isAdmin: Handler = async (c, next) => {
    const token = c.req.header("Authorization")?.split(" ")[1]
    if (!token) return c.json({ message: "No token provided" }, 401)
    const payload = await JWTService.verify(token) as any
    if (!payload) return c.json({ message: "Invalid token" }, 401)
    if (!payload.roles.includes("admin")) return c.json({ message: "User is not admin" }, 403)
    c.set("user", payload)
    await next()
  }
}