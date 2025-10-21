import {
  HydratedDocument,
  InferSchemaType,
  model,
  Schema,
  Types,
} from "mongoose";
import { EstadoEquipoEnLiga, EstadoLiga, TipoFutbolin } from "recreativos-air-core/liga";
import { EquipoDoc } from "../equipo/equipo.model";

const ConfiguracionSchema = new Schema({
  partidosPorEnfrentamiento: { type: Number, required: true },
  golesParaGanar: { type: Number, required: true },
  idaYVuelta: { type: Boolean, required: true },
});

const EquipoEnLigaSchema = new Schema({
  equipo: { type: Types.ObjectId, ref: "Equipo", required: true },
  pagado: { type: Boolean, default: false },
  estado: {
    type: String,
    enum: EstadoEquipoEnLiga,
    default: "Pendiente",
  },
});

const LigaSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    tipoFutbolin: {
      type: String,
      enum: Object.values(TipoFutbolin),
      required: true,
    },
    estadoLiga: {
      type: String,
      enum: Object.values(EstadoLiga),
      default: EstadoLiga.SinEmpezar,
    },
    ubicaciones: { type: [String], default: [] },
    premio: { type: String, default: "" },
    normas: { type: String, default: "" },
    configuracion: {
      type: ConfiguracionSchema,
      required: true,
    },
    equipos: { type: [EquipoEnLigaSchema], default: [] },
    enfrentamientos: [{ type: Types.ObjectId, ref: "Enfrentamiento" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

type EquipoEnLiga = Omit<
  InferSchemaType<typeof EquipoEnLigaSchema>,
  "equipo"
> & {
  equipo: Types.ObjectId | EquipoDoc;
}

export type Liga = Omit<
  InferSchemaType<typeof LigaSchema>,
  "createdBy" | "equipos" | "enfrentamientos"
> & {
  createdBy: Types.ObjectId;
  enfrentamientos: Types.ObjectId[];
  equipos: Array<EquipoEnLiga>;
};
export type LigaDoc = HydratedDocument<Liga>;

export const LigaModel = model<LigaDoc>("Liga", LigaSchema);
