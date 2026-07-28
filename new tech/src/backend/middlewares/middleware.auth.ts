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
}