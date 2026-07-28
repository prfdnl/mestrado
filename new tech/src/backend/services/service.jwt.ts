import type { JWTPayload } from 'hono/utils/jwt/types';
import * as jwt from 'hono/jwt'

export namespace JWTService {
  const secretKey = process.env.JWT_SECRET || "default_secret_key";
  const algorithm = "HS256";

  export async function generate<T extends JWTPayload>(payload: T): Promise<string> {
    payload.exp = Math.floor(Date.now() / 1000) + (60 * 60); // Token expires in 1 hour
    const token = await jwt.sign(payload, secretKey, algorithm);
    return token;
  }

  export async function verify(token: string): Promise<JWTPayload | null> {
    try {
      return  await jwt.verify(token, secretKey, algorithm);
    } catch (error) {
      return null
    }
  }
}