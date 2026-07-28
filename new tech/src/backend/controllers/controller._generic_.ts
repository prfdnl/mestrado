import { GenericDatabase } from "../database/database._generic_";
import { UUIDService } from "../services/service.uuid";
import type { Context } from "hono";

export namespace GenericController {

  export function getMany(tableName: string, databaseColumns: string[]) {
    return async (c: Context) => {
      try {
        const result = await GenericDatabase.getMany(tableName, databaseColumns);
        return c.json(result);
      } catch (error) {
        console.error("Error fetching records:", error);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    }
  }

  export function getOneById(tableName: string, databaseColumns: string[]) {
    return async (c: Context) => {
      const { id } = c.req.param();
      if (!id)
        return c.json({ message: "ID is required" }, 400);
      if (!UUIDService.isValidUUID(id))
        return c.json({ message: "Invalid ID format" }, 400);
      try {
        const result = await GenericDatabase.getOneById(tableName, databaseColumns, id);
        if (!result)
          return c.json({ message: "Record not found" }, 404);
        return c.json(result);
      } catch (error) {
        console.error("Error fetching record:", error);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    }
  }

  export async function getOneByColumn(tableName: string, column: string, c: Context) {
   
  }

  export function createOne(
    tableName: string,
    databaseColumns: string[],
    hooks?: {
      beforeInsert?: (data: Record<string, any>, c: Context) => Promise<any> | any,
      beforeResponse?: (result: any, c: Context) => Promise<any> | any
    }
  ) {
    return async (c: Context) => {
      let data: any;
      try {
        data = await c.req.json();
      } catch (error) {
        return c.json({ message: "Invalid JSON format" }, 400);
      }
      if (hooks?.beforeInsert) {
        const ret = await hooks.beforeInsert(data, c);
        if (ret !== undefined) return ret;
      }
      const insertData: Record<string, any> = {};
      for (const column of databaseColumns) {
        if (data[column] == undefined)
          continue;
        insertData[column] = data[column];
      }
      if (Object.keys(insertData).length === 0)
        return c.json({ message: "No valid fields to insert" }, 400);
      try {
        const result = await GenericDatabase.createOne(tableName, insertData);
        if (hooks?.beforeResponse) {
          const ret = await hooks.beforeResponse(result, c);
          if (ret !== undefined) return ret;
        }
        return c.json(result, 201);
      } catch (error: any) {
        if (error.errno === "23502") {
          const missingColumns = error?.detail?.match(/\((.*?)\)/)?.[1]?.split(", ") ?? [];
          return c.json({ message: "Missing required fields", missingColumns }, 400);
        }
        if (error.errno === "23505") {
          const columns = Object.fromEntries(
            Array.from(
              (error?.detail?.matchAll(/\((.*?)\)=\((.*?)\)/g) ?? []) as Iterable<RegExpMatchArray>,
              (match) => [match[1], match[2]] as const
            )
          );
          return c.json({ message: "Duplicate entry", columns }, 409);
        }
        console.error("Error inserting record:", error);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    }
  }

  export function patchOne(
    tableName: string,
    updateDatabaseColumns: string[],
    hooks?: {
      beforeFilter?: (updates: Record<string, any>, c: Context) => Promise<any> | any,
      beforeUpdate?: (updates: Record<string, any>, c: Context) => Promise<any> | any,
      beforeResponse?: (result: any, c: Context) => Promise<any> | any
    }
  ) {
    return async (c: Context) => {
      const { id } = c.req.param();
      if (!id)
        return c.json({ message: "ID is required" }, 400);
      if (!UUIDService.isValidUUID(id))
        return c.json({ message: "Invalid ID format" }, 400);
      let data: any;
      try {
        data = await c.req.json();
      } catch (error) {
        return c.json({ message: "Invalid JSON format" }, 400);
      }
      const updates: Record<string, any> = {};
      if (hooks?.beforeFilter) {
        const ret = await hooks.beforeFilter(data, c);
        if (ret !== undefined) return ret;
      }
      for (const column of updateDatabaseColumns) {
        if (data[column] == undefined)
          continue;
        updates[column] = data[column];
      }
      if (Object.keys(updates).length === 0)
        return c.json({ message: "No valid fields to update" }, 400);
      if (hooks?.beforeUpdate) {
        const ret = await hooks.beforeUpdate(updates, c);
        if (ret !== undefined) return ret;
      }
      try {
        const result = await GenericDatabase.updateOne(tableName, id, updates);
        if (!result)
          return c.json({ message: "Record not found" }, 404);
        if (hooks?.beforeResponse) {
          const ret = await hooks.beforeResponse(result[0], c);
          if (ret !== undefined) return ret;
        }
        return c.json(result[0]);
      } catch (error: any) {
        if (error.errno === "23505") {
          const columns = Object.fromEntries(
            Array.from(
              (error?.detail?.matchAll(/\((.*?)\)=\((.*?)\)/g) ?? []) as Iterable<RegExpMatchArray>,
              (match) => [match[1], match[2]] as const
            )
          );
          return c.json({ message: "Duplicate entry", columns }, 409);
        }
        console.error("Error updating record:", error);
        return c.json({ message: "Internal Server Error" }, 500);
      }
    }
  }
}