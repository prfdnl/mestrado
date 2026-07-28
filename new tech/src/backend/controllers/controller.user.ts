import { GenericController } from "../controllers/controller._generic_";

import { UserDatabase } from "../database/database.user";
import { UUIDService } from "../services/service.uuid";
import { PasswordService } from "../services/service.password";
import type { Context } from "hono";

export namespace UserController {
  export async function getUserById(c: Context) {
    const fnGet = GenericController.getOneById("users", ["id", "login", "roles", "active"]);
    return fnGet(c);
    // const { id } = c.req.param();
    // if (!id)
    //   return c.json({ message: "User ID is required" }, 400);
    // if (!UUIDService.isValidUUID(id))
    //   return c.json({ message: "Invalid User ID format" }, 400);
    // const user = await UserDatabase.getUserById(id);
    // if (!user)
    //   return c.json({ message: "User not found" }, 404);
    // delete user.password_hash;
    // return c.json(user);
  }

  export async function createUser(c: Context) {
     const fnCreate = GenericController.createOne("users", ["login", "password_hash"], {
      beforeInsert: async (data, c) => {
        if (!data.login || !data.password) return c.json({ message: "Login and Password are required" }, 400);
        data.password_hash = await PasswordService.hash(data.password);
        delete data.password;
      },
      beforeResponse: async (result, c) => {
        if (!result) return;
        delete result.password_hash;
      }
    })
    return fnCreate(c);
  }

  export async function patchUser(c: Context) {
    const fnPatch = GenericController.patchOne("users", ["login", "password_hash", "active"], {
      beforeFilter: async (updates, c) => {
        if (!updates.password) return c.json({ message: "Password is required for update" }, 400);
        updates.password_hash = await PasswordService.hash(updates.password);
      },
      beforeResponse: async (result, c) => {
        if (!result) return
        delete result.password_hash;
      }
    })
    return fnPatch(c);
  }
}