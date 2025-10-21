import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";
import { EstadoJugadorEnEquipo } from "recreativos-air-core/equipos";

const JugadorSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  idUsuario: { type: Schema.Types.ObjectId, ref: "User", default: null },
  estado: {
    type: String,
    enum: Object.values(EstadoJugadorEnEquipo),
    required: true,
    default: EstadoJugadorEnEquipo.PENDIENTE,
  },
  suplente: { type: Boolean, default: false },
});

const EquipoSchema = new Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    color: { type: String },
    jugadores: {
      type: [JugadorSchema],
      validate: [
        {
          validator: (v: Jugador[]) => v.length <= 3,
          message: "Máximo 3 jugadores por equipo (2 + 1 suplente)",
        },
        {
          validator: (v: Jugador[]) =>
            v.filter((j) => j.suplente === true).length <= 1,
          message: "Solo puede haber un suplente por equipo",
        },
      ],
    },
    idCreador: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

type Jugador = InferSchemaType<typeof JugadorSchema>
export type Equipo = InferSchemaType<typeof EquipoSchema>

export type EquipoDoc = HydratedDocument<Equipo>

export const EquipoModel = model<EquipoDoc>("Equipo", EquipoSchema);
