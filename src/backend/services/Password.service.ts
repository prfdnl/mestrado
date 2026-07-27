import argon2 from 'argon2'

export default new class PasswordService {
  async hash(password: string) {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 5,
      parallelism: 1
    })
  }

  async verify(password: string, hash: string) {

    return await argon2.verify(hash, password)
  }
}