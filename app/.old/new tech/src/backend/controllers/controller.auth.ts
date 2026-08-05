import { JWTService } from "../services/service.jwt";
import { PasswordService } from "../services/service.password";
import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import { GenericDatabase } from "../database/database._generic_";
import { use } from "hono/jsx";

export namespace AuthController {
  export async function login(c: Context) {
    let data: any
    try { 
      data = await c.req.json();
    } catch (error) {
      return c.json({ message: "Invalid JSON format" }, 400);
    }
    const { username, password } = data;
    if (!username || !password)
      return c.json({ message: "Username and Password are required" }, 400);
    try {
      const dbData = await GenericDatabase.getOneByColumn("users", ["id", "username", "password_hash", "roles", "active"], "username", username);

      if (!dbData.active)
        return c.json({ message: "User is not active" }, 403);
      if (!dbData)
        return c.json({ message: "Invalid username or password" }, 401);
      const isPasswordValid = await PasswordService.verify(password, dbData.password_hash);
      if (!isPasswordValid)
        return c.json({ message: "Invalid username or password" }, 401);
      delete dbData.password_hash;
      const j = await JWTService.generate({ 
        userId: dbData.id, 
        username: dbData.username,
        roles: dbData.roles 
      });
      delete dbData.password_hash;
      setCookie(c, "refresh-token", j.token, { httpOnly: true, secure: true, sameSite: "strict" });
      return c.json(true);
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
      const n = await JWTService.generate(payload);
      setCookie(c, "refresh-token", n.token, { httpOnly: true, secure: true, sameSite: "strict" });
      return c.json({
        access_token: n.token,
        payload: n.payload
      });
    } catch (error) {
      console.log(error)
      return c.json({ message: "Internal Server Error" }, 500);
    }
  }
}