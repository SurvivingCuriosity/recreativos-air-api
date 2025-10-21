import { ObjectIdLike } from "@/types/types";
import { Types } from "mongoose";
import { EquipoDoc } from "../equipo/equipo.model";
import { Liga, LigaDoc, LigaModel } from "./liga.model";
import { CrearLigaBody } from "recreativos-air-core/liga";

type CrearLigaInput = CrearLigaBody & { equipos: []; createdBy: ObjectIdLike };

export type LigaDocConEquipos = Omit<LigaDoc, "equipos"> & {
  equipos: Array<
    Omit<LigaDoc["equipos"][number], "equipo"> & { equipo: EquipoDoc }
  >;
};

export const LigaRepository = {
  create: async (data: CrearLigaInput): Promise<LigaDoc> => {
    return LigaModel.create(data);
  },

  findAll: async (): Promise<LigaDoc[]> => {
    return LigaModel.find().populate("equipos.equipo").sort({ createdAt: -1 });
  },

  findById: async (id: ObjectIdLike): Promise<LigaDocConEquipos | null> => {
    const doc = await LigaModel.findById(id)
      .populate({
        path: "equipos.equipo",
        select: "_id nombre color jugadores",
      })
      .exec();

    // 🧩 Aquí el cast es seguro, porque acabas de poblar "equipos.equipo"
    return doc as unknown as LigaDocConEquipos | null;
  },

  updateById: async (
    id: ObjectIdLike,
    data: Partial<Liga>
  ): Promise<LigaDoc | null> => {
    return LigaModel.findByIdAndUpdate(id, data, { new: true });
  },

  deleteById: async (id: ObjectIdLike): Promise<LigaDoc | null> => {
    return LigaModel.findByIdAndDelete(id);
  },

  addEquipo: async (
    ligaId: ObjectIdLike,
    equipoId: ObjectIdLike
  ): Promise<LigaDoc | null> => {
    return LigaModel.findByIdAndUpdate(
      ligaId,
      { $push: { equipos: { equipo: new Types.ObjectId(equipoId) } } },
      { new: true }
    );
  },
};
