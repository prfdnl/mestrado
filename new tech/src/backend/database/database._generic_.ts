import { sql } from "bun";
import db from "./connection";

export namespace GenericDatabase {

  export async function getOneById(tableName: string, columns: string[], id: string) {
    const sqlTableName = sql(tableName);
    const sqlColumns = sql(columns.join(", "));
    const result = await db`SELECT ${sqlColumns} FROM ${sqlTableName} WHERE id = ${id}`;
    return result[0];
  }

  export async function getOneByColumn(tableName: string, column: string, value: any) {
    const sqlTableName = sql(tableName);
    const sqlColumn = sql(column);
    const result = await db`SELECT * FROM ${sqlTableName} WHERE ${sqlColumn} = ${value}`;
    return result[0];
  }

  export async function createOne(tableName: string, data: Record<string, any>) {
    const sqlTableName = sql(tableName);
    const columns = Object.keys(data).map((key) => sql(key));
    const values = Object.values(data).map((value) => db`${value}`);    
    const sqlColumns = columns.reduce((acc, curr) => db`${acc}, ${curr}`);
    const sqlValues = values.reduce((acc, curr) => db`${acc}, ${curr}`);
    const result = await db`INSERT INTO ${sqlTableName} (${sqlColumns}) VALUES (${sqlValues}) RETURNING *`;
    return result[0];
  }

  export async function updateOne(tableName: string, id: string, updates: Record<string, any>) {
    const sqlTableName = sql(tableName)
    const sqlSetsSnippets = Object.entries(updates).map(([key, value]) => db`${sql(key)} = ${value}`);
    const setClause = sqlSetsSnippets.reduce((acc, curr) => db`${acc}, ${curr}`);
    return await db`UPDATE ${sqlTableName} SET ${setClause} WHERE id = ${id} RETURNING *`;
  }
}