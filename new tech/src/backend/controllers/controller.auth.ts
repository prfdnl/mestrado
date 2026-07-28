import { JWTService } from "../services/service.jwt";
import { PasswordService } from "../services/service.password";
import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import { GenericDatabase } from "../database/database._generic_";

export namespace AuthController {
  export async function login(c: Context) {
    let data: any
    try { 
      data = await c.req.json();
    } catch (error) {
      return c.json({ message: "Invalid JSON format" }, 400);
    }
    const { login, password } = data;
    if (!login || !password)
      return c.json({ message: "Login and Password are required" }, 400);
    try {
      const dbData = await GenericDatabase.getOneByColumn("users", ["id", "login", "password_hash", "roles"], "login", login);
      if (!dbData)
        return c.json({ message: "Invalid login or password" }, 401);
      const isPasswordValid = await PasswordService.verify(password, dbData.password_hash);
      if (!isPasswordValid)
        return c.json({ message: "Invalid login or password" }, 401);
      delete dbData.password_hash;
      const token = await JWTService.generate({ 
        userId: dbData.id, 
        login: dbData.login,
        roles: dbData.roles 
      });
      delete dbData.password_hash;
      setCookie(c, "refresh-token", token, { httpOnly: true, secure: true, sameSite: "strict" });
      return c.json(token);
    } catch (error) {
      return c.json({ message: "Internal Server Error" }, 500);
    }
  }

  export async function refreshToken(c: Context) {
    const refreshToken = getCookie(c, "refresh-token");
    if (!refreshToken)
      return c.json({ message: "Refresh token is required" }, 401);
    try {
      const payload = await JWTService.verify(refreshToken);
      if (!payload)
        return c.json({ message: "Invalid refresh token" }, 401);
      const newToken = await JWTService.generate(payload);
      setCookie(c, "refresh-token", newToken, { httpOnly: true, secure: true, sameSite: "strict" });
      return c.json(newToken);
    } catch (error) {
      console.log(error)
      return c.json({ message: "Internal Server Error" }, 500);
    }
  }
}