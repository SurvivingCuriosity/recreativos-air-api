import { SearchUserDTO, UserDTO } from "recreativos-air-core/user";

export const UserAdapter = {
  toDto(user: any): UserDTO {
    if (!user) throw new Error("UserAdapter.toDto: user is null or undefined");

    return {
      id: user._id?.toString(),
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      movil: user.movil,
      verified: user.verified,
      admin: user.admin,
      createdAt: user.createdAt,
    };
  },

  toDtoList(users: any[]): UserDTO[] {
    return users.map((u) => UserAdapter.toDto(u));
  },

  toSearchUserDTO(user: any): SearchUserDTO {
    if (!user)
      throw new Error("UserAdapter.toSearchUserDTO: user is null or undefined");
    return {
      id: user._id?.toString(),
      username: user.username,
      nombre: user.nombre,
      email: user.email,
    };
  },

  toSearchUserDTOList(users: any[]): SearchUserDTO[] {
    return users.map((u) => UserAdapter.toSearchUserDTO(u));
  },
};
