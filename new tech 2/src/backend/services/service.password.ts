import argon2 from "argon2"

export namespace PasswordService {
  export async function hash(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 2,
    });
  }

  export async function verify(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
}