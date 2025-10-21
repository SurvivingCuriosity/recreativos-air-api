import { EquipoAdapter } from "../equipo/equipo.adapters";
import { LigaDTO, EquipoEnLigaDTO, ConfiguracionLigaDTO } from "recreativos-air-core/liga";
import { Types } from "mongoose";

export const LigaAdapter = {
  toDTO(liga: any): LigaDTO {
    if (!liga) throw new Error("LigaAdapter.toDTO: liga is null or undefined");

    const equipos: EquipoEnLigaDTO[] = (liga.equipos || []).map((e: any) => ({
      equipo: EquipoAdapter.toDTO(e.equipo),
      pagado: !!e.pagado,
      estado: e.estado,
    }));

    const configuracion: ConfiguracionLigaDTO = {
      partidosPorEnfrentamiento:
        liga.configuracion?.partidosPorEnfrentamiento ?? 0,
      golesParaGanar: liga.configuracion?.golesParaGanar ?? 0,
      idaYVuelta: !!liga.configuracion?.idaYVuelta,
    };

    return {
      id: liga._id.toString(),
      nombre: liga.nombre,
      descripcion: liga.descripcion ?? "",
      tipoFutbolin: liga.tipoFutbolin,
      estadoLiga: liga.estadoLiga,
      ubicaciones: liga.ubicaciones ?? [],
      premio: liga.premio ?? "",
      normas: liga.normas ?? "",
      configuracion,
      equipos,
      createdBy: this.parseId(liga.createdBy),
    };
  },

  toDTOList(ligas: any[]): LigaDTO[] {
    return ligas.map((l) => this.toDTO(l));
  },

  // Helper interno
  parseId(value: any): string {
    if (!value) return "";
    if (value instanceof Types.ObjectId) return value.toString();
    if (typeof value === "object" && value._id) return value._id.toString();
    return String(value);
  },
};
