import { Types } from "mongoose";
import { EquipoAdapter } from "../equipo/equipo.adapters";
import { EnfrentamientoDTO, PartidoDTO } from "recreativos-air-core/enfrentamiento";

export const EnfrentamientoAdapter = {
  toDTO(enf: any): EnfrentamientoDTO {
    if (!enf) throw new Error("EnfrentamientoAdapter.toDTO: enf is null or undefined");

    const parseId = (val: any): string | null => {
      if (!val) return null;
      if (val instanceof Types.ObjectId) return val.toString();
      if (typeof val === "object" && val._id) return val._id.toString();
      return String(val);
    };

    const partidos: PartidoDTO[] = (enf.partidos || []).map((p: any) => ({
      golesA: p.golesA ?? 0,
      golesB: p.golesB ?? 0,
    }));

    return {
      id: parseId(enf._id)!,
      idLiga: parseId(enf.liga)!,
      equipoA: EquipoAdapter.toDTO(enf.equipoA),
      equipoB: EquipoAdapter.toDTO(enf.equipoB),
      estado: enf.estado,
      fecha: enf.fecha ?? null,
      ubicacion: enf.ubicacion ?? "",
      partidos,
      resultadoPropuestoPor: parseId(enf.resultadoPropuestoPor),
      resultadoAceptadoPor: parseId(enf.resultadoAceptadoPor),
      resultadoRechazadoPor: parseId(enf.resultadoRechazadoPor),
    };
  },

  toDTOList(enfs: any[]): EnfrentamientoDTO[] {
    return (enfs || []).map((e) => this.toDTO(e));
  },
};
