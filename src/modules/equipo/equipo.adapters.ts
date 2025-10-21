import { EquipoDTO, JugadorDTO } from "recreativos-air-core/equipos";

export const EquipoAdapter = {
  toDTO(equipo: any): EquipoDTO {
    if (!equipo) throw new Error("EquipoAdapter.toDTO: equipo is null or undefined");

    return {
      id: equipo._id?.toString?.() ?? "",
      idCreador: equipo.idCreador?.toString?.() ?? "",
      nombre: equipo.nombre ?? "",
      color: equipo.color ?? "",
      jugadores: (equipo.jugadores || []).map((j: any) => ({
        idUsuario: j.idUsuario ?? null,
        nombre: j.nombre,
        suplente: !!j.suplente,
        estado: j.estado,
      } as JugadorDTO)),
    };
  },

  toDTOList(equipos: any[]): EquipoDTO[] {
    return equipos.map((e) => this.toDTO(e));
  },
};
