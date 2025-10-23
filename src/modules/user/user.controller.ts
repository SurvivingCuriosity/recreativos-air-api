import { ValidatedRequest } from "@/types/types";
import { ok } from "../../utils/ApiResponse";
import { UserAdapter } from "./user.adapters";
import {
  BuscarUsuariosQueryType,
  GetUserByIdParams,
  UpdateUserBody,
} from "recreativos-air-core/user";
import { UserService } from "./user.service";

export const UserController = {
  getAllUsers: async () => {
    const users = await UserService.getAllUsers();
    return ok(UserAdapter.toDtoList(users), "Usuarios obtenidos");
  },
  getUserById: async (req: ValidatedRequest<GetUserByIdParams>) => {
    const user = await UserService.getById(req.params.id);
    return ok(UserAdapter.toDto(user), "Perfil obtenido correctamente");
  },

  updateUser: async (req: ValidatedRequest<any, UpdateUserBody>) => {
    const updated = await UserService.updateUser(req.user!.id, req.validated);
    return ok(UserAdapter.toDto(updated), "Usuario actualizado correctamente");
  },

  buscarUsuarios: async (
    req: ValidatedRequest<any, any, BuscarUsuariosQueryType>
  ) => {
    const { q, limit } = req.query;
    const usuarios = await UserService.buscarUsuarios(q, limit);
    return ok(
      UserAdapter.toSearchUserDTOList(usuarios),
      "Usuarios encontrados"
    );
  },
};
