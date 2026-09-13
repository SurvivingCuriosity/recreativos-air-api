import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const TemporadaSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    fechaInicio: { type: Date, default: null },
    fechaFin: { type: Date, default: null },
    actual: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type Temporada = Omit<
  InferSchemaType<typeof TemporadaSchema>,
  "fechaInicio" | "fechaFin"
> & {
  fechaInicio: Date | null;
  fechaFin: Date | null;
};
export type TemporadaDoc = HydratedDocument<Temporada>;

export const TemporadaModel = model<TemporadaDoc>("Temporada", TemporadaSchema);
