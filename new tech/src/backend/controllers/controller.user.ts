import { GenericController } from "../controllers/controller._generic_";
import { PasswordService } from "../services/service.password";
import type { Context } from "hono";

export namespace UserController {
  export async function getUserById(c: Context) {
    const fnGet = GenericController.getOneById("user", ["id", "username", "roles", "active"]);
    return fnGet(c);
  }

  export async function createUser(c: Context) {
     const fnCreate = GenericController.createOne("user", ["username", "password_hash"], {
      beforeInsert: async (data, c) => {
        if (!data.password) return c.json({ message: "Username and Password are required" }, 400);
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
    const fnPatch = GenericController.patchOne("user", ["username", "password_hash", "active"], {
      beforeFilter: async (updates, c) => {
        if (!updates.password) return
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