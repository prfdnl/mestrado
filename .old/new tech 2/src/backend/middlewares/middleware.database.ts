import { sql } from "bun"
import { postgres, elasticsearch } from "../database/connection"
import type { Context, Next, Handler } from "hono"
import { PasswordService } from "../services/service.password";

export namespace DatabaseMiddleware {

  // -------------------------------------------------------------------------------------------------------------------

  export const inputMergeParamsAndBody: Handler = async (c, next) => {
    c.set<any>("databaseInput", { ...c.get<any>("validatedJsonBody"), ...c.get<any>("validatedParameters") })
    return next();
  }

  export const inputBodyOnly: Handler = async (c, next) => {
    c.set<any>("databaseInput", { ...c.get<any>("validatedJsonBody") })
    return next();
  }

  export const inputParamsOnly: Handler = async (c, next) => {
    c.set<any>("databaseInput", { ...c.get<any>("validatedParameters") })
    return next();
  }

  export const inputPasswordToPasswordHash: Handler = async (c, next) => {
    const data = c.get<any>("databaseInput")
    if (!data) return c.json({ message: "No data to hash, you forget to c.set('databaseInput', ...)" }, 500);
    if (!data.password) return c.json({ message: "No password to hash, you forget to include 'password' in the data" }, 500);
    data.password_hash = await PasswordService.hash(data.password)
    delete data.password
    c.set<any>("databaseInput", data)
    return await next();
  }

  // --- POSTGRESQL ----------------------------------------------------------------------------------------------------

  function postgresErrors(error: any, c: Context) {
    if (error.errno === "23505") {
      const keyval = error.detail.match(/\(([^)]+)\)=\(([^)]+)\)/)
      const key = keyval ? keyval[1] : "unknown"
      const value = keyval ? keyval[2] : "unknown"
      return c.json({ message: `Duplicate entry`, error: error.detail, key, value }, 400)
    }
    console.error("Postgres error:", error)
    return c.json({ message: "Database error", error: error.message, code: error.errno }, 500)
  }

  export function select(conf: { table: string, columns: string[], where: string[] }): Handler {
    return async (c, next) => {
      const inputData = c.get<any>("databaseInput")
      if (!inputData) return c.json({ message: "No input data, you forget to c.set('databaseInput', ...)" }, 500);
      const table = sql(conf.table)
      const columns = conf.columns.map(col => sql(col)).reduce((acc, curr) => postgres`${acc}, ${curr}`)
      const whereClause = conf.where.map(col => {
        if (!(col in inputData)) return null;
        return postgres`${sql(col)} = ${inputData[col]}`
      }).filter(Boolean).reduce((acc, curr) => postgres`${acc} AND ${curr}`, postgres`true`)
      try {
        const result = await postgres`SELECT ${columns} FROM ${table}${whereClause ? postgres` WHERE ${whereClause}` : postgres``}`
        c.set<any>("databaseResult", result)
        return await next();
      } catch (error: any) {
        return postgresErrors(error, c)
      }
    }
  }

  export function insert(conf: { table: string, returning: string[] }): Handler {
    return async (c, next) => {
      const data = c.get<any>("databaseInput")
      if (!data) return c.json({ message: "No data to insert, you forget to c.set('databaseInput', ...)" }, 500);
      const table = sql(conf.table)
      const columns = Object.keys(data).map(col => sql(col)).reduce((acc, curr) => postgres`${acc}, ${curr}`)
      const values = Object.values(data).map(val => postgres`${val}`).reduce((acc, curr) => postgres`${acc}, ${curr}`)
      const returning = conf.returning.map(col => sql(col)).reduce((acc, curr) => postgres`${acc}, ${curr}`)
      try {
        const result = await postgres`INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING ${returning}`
        c.set<any>("databaseResult", result[0])
        return await next();
      } catch (error: any) {
        return postgresErrors(error, c)
      }
    }
  }

  export function patch(conf: { table: string, returning: string[], where: string[] }): Handler {
    return async (c, next) => {
      const data = c.get<any>("databaseInput")
      if (!data) return c.json({ message: "No data to patch, you forget to c.set('databaseInput', ...)" }, 500);
      const table = sql(conf.table)
      const whereColumns = conf.where.filter(col => col in data)
      if (whereColumns.length !== conf.where.length) {
        const missing = conf.where.filter(col => !(col in data))
        return c.json({ message: "Missing where fields in databaseInput", missing }, 400)
      }
      const setColumns = Object.keys(data).filter(col => !conf.where.includes(col))
      if (setColumns.length === 0) {
        return c.json({ message: "No fields to update" }, 400)
      }
      const setClause = setColumns
        .map(col => sql`${sql(col)} = ${data[col]}`)
        .reduce((acc, curr) => postgres`${acc}, ${curr}`)
      const whereClause = whereColumns
        .map(col => postgres`${sql(col)} = ${data[col]}`)
        .reduce((acc, curr) => postgres`${acc} AND ${curr}`, postgres`true`)
      const returning = conf.returning.map(col => sql(col)).reduce((acc, curr) => postgres`${acc}, ${curr}`)
      try {
        const result = await postgres`UPDATE ${table} SET ${setClause} WHERE ctid IN (SELECT ctid FROM ${table} WHERE ${whereClause} LIMIT 1) RETURNING ${returning}`
        c.set<any>("databaseResult", result[0])
        return await next();
      } catch (error: any) {
        return postgresErrors(error, c)
      }
    }
  }

  export function deleteOne(conf: { table: string, where: string[] }): Handler {
    return async (c, next) => {
      const data = c.get<any>("databaseInput")
      if (!data) return c.json({ message: "No data to delete, you forget to c.set('databaseInput', ...)" }, 500);
      const table = sql(conf.table)
      const missingWhere = conf.where.filter(col => !(col in data))
      if (missingWhere.length > 0) return c.json({ message: "Missing where fields in databaseInput", missing: missingWhere }, 400)
      const whereClause = conf.where
        .map(col => postgres`${sql(col)} = ${data[col]}`)
        .reduce((acc, curr) => postgres`${acc} AND ${curr}`, postgres`true`)
      try {
        await postgres`DELETE FROM ${table} WHERE ${whereClause}`
        c.set<any>("databaseResult", { message: "Deleted successfully" })
        return await next();
      } catch (error: any) {
        return postgresErrors(error, c)
      }
    }
  }

  // --- ELASTICSEARCH -------------------------------------------------------------------------------------------------

  export function search(conf: { index: string }): Handler {
    return async (c, next) => {
      const query = c.req.param("query")!;
      try {
        const result = await elasticsearch.search({
          index: conf.index,
          query: {
            multi_match: {
              query: query,
              fields: ["*"],
              type: "bool_prefix"
            }
          }
        });
        c.set('searchResult', result.hits.hits.map(hit => hit._source))
        return await next();
      } catch (error: any) {
        console.error("Elasticsearch search error:", error);
        return c.json({ message: "Elasticsearch search error", error: error.message }, 500)
      }
    }
  }

  export function index(conf: { index: string, id: string }): Handler {
    return async (c, next) => {
      const data = c.get<any>("databaseResult")
      if (!data) return c.json({ message: "No data to index, you forget to c.set('databaseResult', ...)" }, 500);
      try {
        await elasticsearch.index({
          index: conf.index,
          id: data[conf.id],
          document: data
        })
        return await next();
      } catch (error: any) {
        console.error("Elasticsearch error:", error)
        return c.json({ message: "Elasticsearch error", error: error.message }, 500)
      }
    }
  }

  export function indexUpdate(conf: { index: string, id: string }): Handler {
    return async (c, next) => {
      const data = c.get<any>("databaseResult")
      if (!data) return c.json({ message: "No data to update in index, you forget to c.set('databaseResult', ...)" }, 500);
      try {
        const result = await elasticsearch.update({
          index: conf.index,
          id: data[conf.id],
          doc: data
        })
        return await next();
      } catch (error: any) {
        try {
          // If the document does not exist, index it instead
          if (error.meta && error.meta.statusCode === 404) {
            await elasticsearch.index({
              index: conf.index,
              id: data[conf.id],
              document: data
            })
            return await next();
          }
        } catch (indexError: any) {
          return c.json({ message: "Elasticsearch index error", error: indexError.message }, 500)
        }
        return c.json({ message: "Elasticsearch error", error: error.message }, 500)
      }
    }
  }

  export function indexDelete(conf: { index: string, id: string }): Handler {
    return async (c, next) => {
      const data = c.get<any>("databaseInput")
      if (!data) return c.json({ message: "No data to delete from index, you forget to c.set('databaseInput', ...)" }, 500);
      try {
        try {
          await elasticsearch.delete({ index: conf.index, id: data[conf.id] })
        } catch (error: any) {
        }
        return await next();
      } catch (error: any) {
        console.error("Elasticsearch error:", error)
        return c.json({ message: "Elasticsearch error", error: error.message }, 500)
      }
    }
  }

}