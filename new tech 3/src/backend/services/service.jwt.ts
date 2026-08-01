import type { JWTPayload } from 'hono/utils/jwt/types';
import * as jwt from 'hono/jwt'

export namespace JWTService {
  const secretKey = process.env.JWT_SECRET || "default_secret_key";
  const algorithm = "HS256";

  export async function generate<T extends JWTPayload>(payload: T): Promise<{ token: string; payload: T }> {
    payload.exp = (Math.floor(Date.now() / 1000) + (60 * 60)) * 15; // Token expires in 15 hours
    const token = await jwt.sign(payload, secretKey, algorithm);
    return { token, payload };
  }

  export async function refresh<T extends JWTPayload>(token: string): Promise<{ token: string; payload: T } | null> {
    const payload = await verify(token) as T | null;
    if (!payload) return null;
    delete payload.exp; // Remove the exp field to avoid issues when generating a new token
    return generate(payload);
  }

  export async function verify(token: string): Promise<JWTPayload | null> {
    try {
      return await jwt.verify(token, secretKey, algorithm);
    } catch (error) {
      return null
    }
  }
}