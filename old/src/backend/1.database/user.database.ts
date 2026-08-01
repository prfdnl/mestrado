import db from './connection'
import PasswordService from '../0.services/Password.service'

class CreateUserErrorDuplicate extends Error {
  constructor() {
    super('User already exists')
    this.name = 'CreateUserErrorDuplicate'
  }
}
export namespace UserDatabase {
  export async function createUser(name: string, password: string) {
    const hashedPassword = await PasswordService.hash(password)
    try {
      const result = await db`INSERT INTO users (name, password) VALUES (${name}, ${hashedPassword}) RETURNING *`
      return result[0]
    } catch (error: any) {
      if (error?.errno === '23505')
        throw new CreateUserErrorDuplicate()
      throw error
    }
  }

  export async function getUserById(id: number) {
    const result = await db`SELECT * FROM users WHERE id = ${id} LIMIT 1`
    if (result.length === 0)
      return null
    return result[0]
  }

  export async function getUserByName(name: string) {
    const result = await db`SELECT * FROM users WHERE name = ${name} LIMIT 1`
    if (result.length === 0)
      return null
    return result[0]
  }
}