import { Types } from "mongoose";
import { Equipo, EquipoModel } from "./equipo.model";
import { ObjectIdLike } from "@/types/types";

export const EquipoRepository = {
  async create(data: Partial<Equipo>) {
    return EquipoModel.create(data);
  },

  async findById(id: ObjectIdLike) {
    return EquipoModel.findById(id);
  },

  async findAll() {
    return EquipoModel.find();
  },

  async findByUserId(userId: ObjectIdLike) {
    return EquipoModel.find({ "jugadores.idUsuario": new Types.ObjectId(userId) });
  },

  async updateById(id: ObjectIdLike, data: Partial<Equipo>) {
    return EquipoModel.findByIdAndUpdate(id, data, { new: true });
  },
};
