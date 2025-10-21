import { ApiError } from "../../utils/ApiError";
import { User } from "./user.model";
import { UserRepository } from "./user.repository";

export const UserService = {
  getById: async (id: string) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new ApiError(404, "Usuario no encontrado");
    return user;
  },

  getByEmail: async (email: string) => {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new ApiError(404, "Usuario no encontrado");
    return user;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const updated = await UserRepository.update(id, data);
    if (!updated) throw new ApiError(404, "No se pudo actualizar el usuario");
    return updated;
  },

  buscarUsuarios: async (q: string, limit: number) => {
    const users = await UserRepository.search(q, limit);
    return users
  },
};
