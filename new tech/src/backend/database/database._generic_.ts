import { sql } from "bun";
import { postgres, elasticsearch } from "./connection";

export namespace GenericDatabase {

  export async function search(tableName: string, query: string) {
    try {
      const result = await elasticsearch.search({
        index: tableName,
        query: {
          multi_match: {
            query: query,
            fields: ["*"],
            type: "bool_prefix"
          }
        }
      });
      return result.hits.hits.map(hit => hit._source);
    } catch (error) {
      console.error("Elasticsearch search error:", error);
      return []
    }
  }

  export async function getMany(tableName: string, columns?: string[]) {
    const sqlTableName = sql(tableName);
    const sqlColumns = columns
      ? columns.map((column) => sql(column)).reduce((acc, curr) => postgres`${acc}, ${curr}`)
      : sql`*`;
    const result = await postgres`SELECT ${sqlColumns} FROM ${sqlTableName}`;
    return result;
  }

  export async function getOneById(tableName: string, columns: string[], id: string) {
    const sqlTableName = sql(tableName);
    const sqlColumns = columns.map((column) => sql(column)).reduce((acc, curr) => postgres`${acc}, ${curr}`);
    const result = await postgres`SELECT ${sqlColumns} FROM ${sqlTableName} WHERE id = ${id}`;
    return result[0];
  }

  export async function getOneByColumn(tableName: string, columns: string[], searchColumn: string, value: any) {
    const sqlTableName = sql(tableName);
    const sqlColumn = sql(searchColumn);
    const sqlColumns = columns.map((column) => sql(column)).reduce((acc, curr) => postgres`${acc}, ${curr}`);
    const result = await postgres`SELECT ${sqlColumns} FROM ${sqlTableName} WHERE ${sqlColumn} = ${value}`;
    return result[0];
  }

  export async function getManyByColumn(tableName: string, columns: string[], searchColumn: string, value: any) {
    const sqlTableName = sql(tableName);
    const sqlColumn = sql(searchColumn);
    const sqlColumns = columns.map((column) => sql(column)).reduce((acc, curr) => postgres`${acc}, ${curr}`);
    const result = await postgres`SELECT ${sqlColumns} FROM ${sqlTableName} WHERE ${sqlColumn} = ${value}`;
    return result;
  }

  export async function deleteOneById(tableName: string, id: string) {
    const sqlTableName = sql(tableName);
    await elasticsearch.delete({
      index: tableName,
      id: id
    });
    await postgres`DELETE FROM ${sqlTableName} WHERE id = ${id}`;
  }

  export async function createOne(tableName: string, data: Record<string, any>) {
    const sqlTableName = sql(tableName);
    const columns = Object.keys(data).map((key) => sql(key));
    const values = Object.values(data).map((value) => postgres`${value}`);
    const sqlColumns = columns.reduce((acc, curr) => postgres`${acc}, ${curr}`);
    const sqlValues = values.reduce((acc, curr) => postgres`${acc}, ${curr}`);
    const result = await postgres`INSERT INTO ${sqlTableName} (${sqlColumns}) VALUES (${sqlValues}) RETURNING *`;
    if (result.length) {
      await elasticsearch.index({
        index: tableName,
        id: result[0].id,
        document: result[0]
      });
    }
    return result[0];
  }

  export async function updateOne(tableName: string, id: string, updates: Record<string, any>) {
    const sqlTableName = sql(tableName)
    const sqlSetsSnippets = Object.entries(updates).map(([key, value]) => postgres`${sql(key)} = ${value}`);
    let setClause = sqlSetsSnippets.reduce((acc, curr) => postgres`${acc}, ${curr}`);
    setClause = postgres`${setClause}, updated_at = NOW()`;
    const result = await postgres`UPDATE ${sqlTableName} SET ${setClause} WHERE id = ${id} RETURNING *`;
    await elasticsearch.update({
      index: tableName,
      id: id,
      doc: result[0]
    });
    return result;
  }
}