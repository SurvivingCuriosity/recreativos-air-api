import { ObjectIdLike } from "@/types/types";
import { EstadoEnfrentamiento } from "recreativos-air-core/enfrentamiento";
import {
  EnfrentamientoDoc,
  EnfrentamientoDocConEquipos,
  EnfrentamientoModel,
} from "./enfrentamiento.model";

type EnfrentamientoCreate = Omit<
  EnfrentamientoDoc,
  "_id" | "createdAt" | "updatedAt"
>;
type EnfrentamientoUpdate = Partial<EnfrentamientoDoc>;

export const EnfrentamientoRepository = {
  async findByLiga(ligaId: string) {
    return EnfrentamientoModel.find({ liga: ligaId })
      .populate("equipoA")
      .populate("equipoB")
      .exec();
  },

  async findById(id: ObjectIdLike): Promise<EnfrentamientoDoc | null> {
    return EnfrentamientoModel.findById(id)
      .populate("equipoA")
      .populate("equipoB")
      .exec();
  },

  async create(data: EnfrentamientoCreate) {
    return EnfrentamientoModel.create(data);
  },

  async save(enf: EnfrentamientoDoc) {
    return enf.save();
  },

  async updateById(id: ObjectIdLike, data: EnfrentamientoUpdate) {
    return EnfrentamientoModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate("equipoA")
      .populate("equipoB")
      .exec();
  },

  async deleteById(id: ObjectIdLike) {
    return EnfrentamientoModel.findByIdAndDelete(id).exec();
  },

  async deleteByLigaAndEquipo(ligaId: ObjectIdLike, equipoId: ObjectIdLike) {
    return EnfrentamientoModel.deleteMany({
      liga: ligaId,
      $or: [{ equipoA: equipoId }, { equipoB: equipoId }],
    });
  },

  async findJugadosPorLiga(
    ligaId: ObjectIdLike
  ): Promise<EnfrentamientoDocConEquipos[]> {
    return (await EnfrentamientoModel.find({
      liga: ligaId,
      estado: EstadoEnfrentamiento.Jugado,
    })
      .populate("equipoA")
      .populate("equipoB")
      .exec()) as unknown as EnfrentamientoDocConEquipos[];
  },
};
