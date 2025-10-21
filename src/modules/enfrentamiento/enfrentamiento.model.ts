import { Schema, model, Types, InferSchemaType, HydratedDocument } from "mongoose";
import { EquipoDoc } from "../equipo/equipo.model";
import { EstadoEnfrentamiento } from "recreativos-air-core/enfrentamiento";

const PartidoSchema = new Schema({
  golesA: { type: Number, required: true, default: 0 },
  golesB: { type: Number, required: true, default: 0 },
});

const EnfrentamientoSchema = new Schema(
  {
    liga: { type: Types.ObjectId, ref: "Liga", required: true },
    equipoA: { type: Types.ObjectId, ref: "Equipo", required: true },
    equipoB: { type: Types.ObjectId, ref: "Equipo", required: true },
    partidos: { type: [PartidoSchema], required: true },
    estado: {
      type: String,
      enum: Object.values(EstadoEnfrentamiento),
      default: EstadoEnfrentamiento.SinJugar,
      required: true,
    },
    resultadoPropuestoPor: { type: Types.ObjectId, ref: "Equipo" },
    resultadoAceptadoPor: { type: Types.ObjectId, ref: "Equipo" },
    resultadoRechazadoPor: { type: Types.ObjectId, ref: "Equipo" },
    fecha: { type: Date, default: null, required: false },
    ubicacion: { type: String, default: "" },
  },
  { timestamps: true }
);

export type Enfrentamiento = InferSchemaType<typeof EnfrentamientoSchema> & {
  fecha: Date | null;
};
export type EnfrentamientoDoc = HydratedDocument<Enfrentamiento>;

export type EnfrentamientoDocConEquipos = Omit<EnfrentamientoDoc, "equipoA" | "equipoB"> & {
  equipoA: EquipoDoc;
  equipoB: EquipoDoc;
};

export const EnfrentamientoModel = model<EnfrentamientoDoc>(
  "Enfrentamiento",
  EnfrentamientoSchema
);
