import { sql } from "bun";
import db from "../database/connection";

class CreateUserDuplicateError extends Error {
  constructor() {
    super("User already exists");
    this.name = "CreateUserDuplicateError";
  }
}

export namespace UserDatabase {
  export async function getUserById(id: string) {
    const result = await db`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    if (result.length === 0) return null;
    return result[0];
  }

  export async function getUserByLogin(login: string) {
    const result = await db`SELECT * FROM users WHERE login = ${login} LIMIT 1`;
    if (result.length === 0) return null;
    return result[0];
  }

  export async function createUser(login: string, password: string) {
    try {
      const result = await db`INSERT INTO users (login, password_hash) VALUES (${login}, ${password}) RETURNING *`;
      return result[0];
    } catch (error: any) {
      if (error.errno === "23505")
        throw new CreateUserDuplicateError;
      throw error;
    }
  }

  // export async function updateUser(id: string, login?: string, password?: string, active?: boolean) {
  //   // const hasUpdates = login !== undefined || password !== undefined || active !== undefined;
  //   // if (!hasUpdates) return null;

  //   // let setsClausesArr = db``;
    
  //   // if (login !== undefined) 
  //   //   setsClausesArr = db`${setsClausesArr}, login = ${login}`;
    
  //   // if (password !== undefined) 
  //   //   setsClausesArr = db`${setsClausesArr}, password_hash = ${password}`;
    
  //   // if (active !== undefined) 
  //   //   setsClausesArr = db`${setsClausesArr}, active = ${active}`;

  //   // login         = COALESCE(${login ?? null}, login),
  //   // password_hash = COALESCE(${password ?? null}, password_hash),
  //   // active        = COALESCE(${active ?? null}, active)

  //   // let setClause = sets[0];
  //   // for (let i = 1; i < sets.length; i++) {
  //   //   setClause = db`${setClause}, ${sets[i]}`;
  //   // }

  //   // const tableName = db`users`;

  //   // const result = await db`
  //   //   UPDATE 
  //   //     ${tableName}
  //   //   SET
  //   //     ${setsClausesArr}
  //   //   WHERE 
  //   //     id = ${id}
  //   //   RETURNING *
  //   // `;
  //   const result = await simpleUpdate("users", id, { login, password_hash: password, active });
  //   if (result.length === 0) return null;
  //   delete result[0].password_hash;
  //   return result[0];
  // }
}