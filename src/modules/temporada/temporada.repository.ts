import { ObjectIdLike } from "@/types/types";
import { Temporada, TemporadaDoc, TemporadaModel } from "./temporada.model";

export const TemporadaRepository = {
  create: async (data: Partial<Temporada>): Promise<TemporadaDoc> => {
    return TemporadaModel.create(data);
  },

  findAll: async (): Promise<TemporadaDoc[]> => {
    return TemporadaModel.find().sort({ createdAt: -1 });
  },

  findById: async (id: ObjectIdLike): Promise<TemporadaDoc | null> => {
    return TemporadaModel.findById(id);
  },

  findActual: async (): Promise<TemporadaDoc | null> => {
    return TemporadaModel.findOne({ actual: true });
  },

  updateById: async (
    id: ObjectIdLike,
    data: Partial<Temporada>
  ): Promise<TemporadaDoc | null> => {
    return TemporadaModel.findByIdAndUpdate(id, data, { new: true });
  },

  unsetActualExcept: async (id: ObjectIdLike) => {
    return TemporadaModel.updateMany(
      { _id: { $ne: id }, actual: true },
      { $set: { actual: false } }
    );
  },

  deleteById: async (id: ObjectIdLike): Promise<TemporadaDoc | null> => {
    return TemporadaModel.findByIdAndDelete(id);
  },
};
