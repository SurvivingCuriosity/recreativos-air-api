import { ApiError } from "@/utils/ApiError";
import { Types } from "mongoose";
import { EstadoEnfrentamiento } from "recreativos-air-core/enfrentamiento";
import { Enfrentamiento } from "./enfrentamiento.model";
import { EnfrentamientoRepository } from "./enfrentamiento.repository";

type ObjectIdLike = string | Types.ObjectId;
type PartidoInput = { golesA: number; golesB: number };

type ProponerResultadoInput = {
  enfrentamientoId: ObjectIdLike;
  equipoId: ObjectIdLike;
  partidos: PartidoInput[];
};

type AceptarRechazarInput = {
  enfrentamientoId: ObjectIdLike;
  equipoId: ObjectIdLike;
};

export const EnfrentamientoService = {
  async obtenerPorLiga(ligaId: ObjectIdLike): Promise<Enfrentamiento[]> {
    return await EnfrentamientoRepository.findByLiga(ligaId.toString());
  },

  async obtenerEnfrentamiento(
    idEnfrentamiento: ObjectIdLike
  ): Promise<Enfrentamiento | null> {
    return await EnfrentamientoRepository.findById(idEnfrentamiento);
  },

  async proponerResultado({
    enfrentamientoId,
    equipoId,
    partidos,
  }: ProponerResultadoInput): Promise<Enfrentamiento> {
    console.log("idEnfrentamiento: ", enfrentamientoId);
    const enf = await EnfrentamientoRepository.findById(enfrentamientoId);
    console.log("enf: ", enf);
    if (!enf) throw new ApiError(404, "Enfrentamiento no encontrado");

    const idEquipo = new Types.ObjectId(equipoId);
    console.log("idEquipo: ", idEquipo);

    const pertenece =
      idEquipo.equals(getEquipoId(enf.equipoA as Types.ObjectId)) ||
      idEquipo.equals(getEquipoId(enf.equipoB as Types.ObjectId));

    console.log("Pertenece: ", pertenece);

    if (!pertenece)
      throw new ApiError(403, "No puedes proponer este resultado");

    enf.partidos = partidos as any;
    enf.resultadoPropuestoPor = idEquipo as any;
    enf.resultadoAceptadoPor = undefined;
    enf.resultadoRechazadoPor = undefined;
    enf.estado = EstadoEnfrentamiento.CorroborarResultado;

    await EnfrentamientoRepository.save(enf);
    return (await EnfrentamientoRepository.findById(enf._id))!;
  },

  async aceptarResultado({
    enfrentamientoId,
    equipoId,
  }: AceptarRechazarInput): Promise<Enfrentamiento> {
    const enf = await EnfrentamientoRepository.findById(enfrentamientoId);
    if (!enf) throw new ApiError(404, "Enfrentamiento no encontrado");

    const idEquipo = new Types.ObjectId(equipoId);
    const pertenece =
      idEquipo.equals(getEquipoId(enf.equipoA as Types.ObjectId)) ||
      idEquipo.equals(getEquipoId(enf.equipoB as Types.ObjectId));
    if (!pertenece) throw new ApiError(403, "No puedes aceptar este resultado");

    if (!enf.resultadoPropuestoPor)
      throw new ApiError(400, "Aún no hay resultado propuesto");

    enf.resultadoAceptadoPor = idEquipo as any;
    enf.estado = EstadoEnfrentamiento.ConfirmarResultado;

    await EnfrentamientoRepository.save(enf);
    return (await EnfrentamientoRepository.findById(enf._id))!;
  },

  async rechazarResultado({
    enfrentamientoId,
    equipoId,
  }: AceptarRechazarInput): Promise<Enfrentamiento> {
    const enf = await EnfrentamientoRepository.findById(enfrentamientoId);
    if (!enf) throw new ApiError(404, "Enfrentamiento no encontrado");

    const idEquipo = new Types.ObjectId(equipoId);

    const pertenece =
      idEquipo.equals(getEquipoId(enf.equipoA as Types.ObjectId)) ||
      idEquipo.equals(getEquipoId(enf.equipoB as Types.ObjectId));

    if (!pertenece)
      throw new ApiError(403, "No puedes rechazar este resultado");

    enf.partidos = enf.partidos.map(() => ({ golesA: 0, golesB: 0 })) as any;
    enf.resultadoPropuestoPor = undefined;
    enf.resultadoAceptadoPor = undefined;
    enf.resultadoRechazadoPor = idEquipo as any;
    enf.estado = EstadoEnfrentamiento.SinJugar;
    enf.fecha = null;

    await EnfrentamientoRepository.save(enf);
    return (await EnfrentamientoRepository.findById(enf._id))!;
  },

  async confirmarResultadoAdmin(
    enfrentamientoId: ObjectIdLike
  ): Promise<Enfrentamiento> {
    const enf = await EnfrentamientoRepository.findById(enfrentamientoId);
    if (!enf) throw new ApiError(404, "Enfrentamiento no encontrado");

    enf.estado = EstadoEnfrentamiento.Jugado;
    enf.fecha = new Date();

    await EnfrentamientoRepository.save(enf);
    return (await EnfrentamientoRepository.findById(enf._id))!;
  },
};

function getEquipoId(equipo: Types.ObjectId | { _id: Types.ObjectId }) {
  return equipo instanceof Types.ObjectId ? equipo : equipo._id;
}
