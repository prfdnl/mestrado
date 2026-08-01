import type { Context, Next } from "hono";
import { JWTService } from "../services/service.jwt";

export namespace AuthMiddleware {
  export async function authenticate(c: Context, next: Next) {
    const authHeader = c.req?.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) 
      return c.json({ message: "Missing or invalid Authorization header" }, 401);
    const token = authHeader.split(" ")[1];
    if (!token)
      return c.json({ message: "Missing token" }, 401);
    const payload = await JWTService.verify(token);
    if (!payload) 
      return c.json({ message: "Invalid or expired token" }, 401);
    c.set("user", payload);
    await next();
  }

  export function adminOnly(c: Context, next: Next) {
    const user = c.get<any>("user");
    if (!user || !user.roles || !user.roles.includes("admin")) {
      return c.json({ message: "Admin access required" }, 403);
    }
    return next();
  }

  export function userOwnership(userParamName: string = "id") {
    return async (c: Context, next: Next) => {
      const user = c.get<any>("user");
      const userId = c.req.param(userParamName);
      if (!user || !user.roles || !user.roles.includes("admin") && user.userId !== userId)
        return c.json({ message: "User not owner" }, 401);
      return  next();
    }
  }

  export function userGenericOwnership(fn: () => Promise<any>) {
    return async (c: Context, next: Next) => {
      const user = c.get<any>("user");
      const dbdata = await fn()
      console.log(dbdata)
      return  next();
    }
  }
}