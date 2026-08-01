import { Context } from 'hono';
import JwtService from '../0.services/Jwt.service';

export async function authMiddleware(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return c.json("Unauthorized", 401);
  const token = authHeader.split(' ')[1];
  if (!token)
    return c.json("Unauthorized", 401);
  const data = await JwtService.verify(token)
  if (!data)
    return c.json("Unauthorized", 401);
  return next();
}