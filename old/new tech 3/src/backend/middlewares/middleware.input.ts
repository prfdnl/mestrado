import { type } from "arktype"
import type { Type } from "arktype"
import type { Handler } from "hono"

export namespace InputMiddleware {

  export const jsonBodyParse: Handler = async (c, next) => {
    try {
      const body = await c.req.json()
      c.set("jsonBody", body)
      await next()
    } catch (error: any) {
      return c.json({ message: "Invalid JSON body", error: error.message }, 400)
    }
  }

  export function jsonBodyValidate(schema: Type): Handler {
    return async (c, next) => {
      const body = c.get<any>("jsonBody")
      const schemaStrict = schema.onUndeclaredKey("reject")
      const result = schemaStrict(body)
      if (result instanceof type.errors)
        return c.json({ message: "Invalid body", errors: result.summary }, 400)
      c.set("validatedJsonBody", result)
      await next()
    }
  }

  export function paramsValidate(schema: Type): Handler {
    return async (c, next) => {
      const params = c.req.param()
      const schemaStrict = schema.onUndeclaredKey("reject")
      const result = schemaStrict(params)
      if (result instanceof type.errors)
        return c.json({ message: "Invalid parameters", errors: result.summary }, 400)
      c.set("validatedParameters", result);
      await next();
    }
  }

}